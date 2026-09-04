import {
    resolveCompanyIds,
    searchPeople,
    exportPeopleWithEmail,
    fetchExportResults,
    findMobilePhone,
} from './aiark.service.js';
import { mapPersonToContact, capContactsPerCompany } from '../helpers/contactHelpers.js';
import { MAX_CONTACTS_PER_COMPANY, AIARK_BATCH_SIZE, AIARK_BATCH_DELAY_MS } from '../constants/aiArkConstants.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Step 1: resolve domains -> AI-Ark company UUIDs
export const resolveCompanies = async (cleanedCompanies) => {
    const domains = cleanedCompanies.map((c) => c.companyDomain).filter(Boolean);
    if (!domains.length) return { companyIds: [], domainToId: new Map() };

    const domainToId = await resolveCompanyIds(domains);
    return { companyIds: [...domainToId.values()], domainToId };
};

// Step 2a: no email wanted — plain people search
export const lookupContactsWithoutEmail = async ({ companyIds, personaTitles }) => {
    const size = Math.min(companyIds.length * MAX_CONTACTS_PER_COMPANY * 3, 100);
    const data = await searchPeople({ companyIds, personaTitles, size });

    const contacts = (data.content || []).map(mapPersonToContact);
    return capContactsPerCompany(contacts);
};

// Step 2b: email wanted — async export, resolved later by webhook
export const startContactExport = async ({ companyIds, personaTitles, webhookUrl }) => {
    const size = Math.min(companyIds.length * MAX_CONTACTS_PER_COMPANY * 3, 10000);
    return exportPeopleWithEmail({ companyIds, personaTitles, size, webhookUrl });
};

// Step 3: called from the AI-Ark webhook once the export finishes
export const collectExportResults = async (trackId) => {
    const contacts = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
        const data = await fetchExportResults(trackId, page, 100);
        const items = data.content || [];
        contacts.push(...items.map(mapPersonToContact));

        if (page === 0 && items.length) {
            console.log('RAW INQUIRY SAMPLE:', JSON.stringify(items[0], null, 2));
        }

        hasMore = items.length === 100;
        page += 1;
    }

    return capContactsPerCompany(contacts);
};

// Step 4 (optional): phone numbers, batched to respect rate limits
export const enrichWithPhones = async (contacts) => {
    const enriched = [];

    for (let i = 0; i < contacts.length; i += AIARK_BATCH_SIZE) {
        const batch = contacts.slice(i, i + AIARK_BATCH_SIZE);

        const results = await Promise.all(
            batch.map(async (contact) => {
                if (!contact.linkedinUrl) return contact;
                try {
                    const data = await findMobilePhone(contact.linkedinUrl);
                    const phone = data?.data?.[0]?.[0] || null;
                    return { ...contact, mobilePhone: phone };
                } catch (error) {
                    console.error(`Phone lookup failed for ${contact.fullName}:`, error.message);
                    return contact;
                }
            })
        );

        enriched.push(...results);

        if (i + AIARK_BATCH_SIZE < contacts.length) {
            await sleep(AIARK_BATCH_DELAY_MS);
        }
    }

    return enriched;
};