import axios from 'axios';
import { AIARK_BASE_URL, AIARK_ENDPOINTS } from '../constants/aiArkConstants.js';

const aiArkClient = axios.create({
    baseURL: AIARK_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

aiArkClient.interceptors.request.use((config) => {
    config.headers['X-TOKEN'] = process.env.AI_ARK_API_KEY;
    return config;
});

export const fetchCredits = async () => {
    const { data } = await aiArkClient.get(AIARK_ENDPOINTS.CREDITS);
    return data.total;
};

// resolve our scraped domains to AI-Ark company UUIDs
export const resolveCompanyIds = async (domains) => {
    const { data } = await aiArkClient.post(AIARK_ENDPOINTS.COMPANY_SEARCH, {
        account: {
            domain: { any: { include: domains } },
        },
        page: 0,
        size: Math.min(domains.length, 100),
    });

    const map = new Map();
    (data.content || []).forEach((company) => {
        const domain = company.link?.domain || company.link?.domain_ltd;
        if (domain) map.set(domain.toLowerCase(), company.id);
    });

    return map;
};

// people search only — no emails
export const searchPeople = async ({ companyIds, personaTitles, size = 25 }) => {
    const { data } = await aiArkClient.post(AIARK_ENDPOINTS.PEOPLE_SEARCH, {
        contact: {
            company: { latest: { any: { include: companyIds } } },
            experience: {
                latest: {
                    title: { any: { include: { mode: 'SMART', content: personaTitles } } },
                },
            },
        },
        page: 0,
        size,
    });

    return data;
};

// search + email in one async call
export const exportPeopleWithEmail = async ({ companyIds, personaTitles, size, webhookUrl }) => {
    const { data } = await aiArkClient.post(AIARK_ENDPOINTS.PEOPLE_EXPORT, {
        contact: {
            company: { latest: { any: { include: companyIds } } },
            experience: {
                latest: {
                    title: { any: { include: { mode: 'SMART', content: personaTitles } } },
                },
            },
        },
        page: 0,
        size,
        webhook: webhookUrl,
    });

    return data; // { trackId, statistics, state }
};

export const fetchExportResults = async (trackId, page = 0, size = 100) => {
    const { data } = await aiArkClient.get(AIARK_ENDPOINTS.EXPORT_INQUIRIES(trackId), {
        params: { page, size },
    });
    return data;
};

export const findMobilePhone = async (linkedinUrl) => {
    const { data } = await aiArkClient.post(AIARK_ENDPOINTS.MOBILE_FINDER, {
        linkedin: linkedinUrl,
    });
    return data;
};