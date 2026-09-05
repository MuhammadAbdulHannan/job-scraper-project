// strip protocol/www so scraped and AI-Ark domains compare equal
export const normalizeDomain = (domain) => {
    if (!domain) return '';
    return String(domain)
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/.*$/, '')
        .trim();
};

// join contacts back to the job posting that surfaced their company
export const buildExportRows = (contacts = [], filteredJobs = []) => {
    const byDomain = new Map();
    const byName = new Map();

    filteredJobs.forEach((job) => {
        const domain = normalizeDomain(job.companyDomain);
        if (domain) {
            if (!byDomain.has(domain)) byDomain.set(domain, []);
            byDomain.get(domain).push(job);
        }

        const name = (job.companyName || '').toLowerCase().trim();
        if (name) {
            if (!byName.has(name)) byName.set(name, []);
            byName.get(name).push(job);
        }
    });

    return contacts.map((contact) => {
        const matches =
            byDomain.get(normalizeDomain(contact.companyDomain)) ||
            byName.get((contact.companyName || '').toLowerCase().trim()) ||
            [];

        const job = matches[0] || {};

        return {
            fullName: contact.fullName,
            title: contact.title,
            seniority: contact.seniority,
            department: contact.department,
            email: contact.email,
            emailStatus: contact.emailStatus,
            emailDomainType: contact.emailDomainType,
            emailIsGeneric: contact.emailIsGeneric === null ? '' : contact.emailIsGeneric ? 'Yes' : 'No',
            mobilePhone: contact.mobilePhone,
            linkedinUrl: contact.linkedinUrl,
            location: contact.location,
            companyName: contact.companyName,
            companyDomain: contact.companyDomain,
            companyWebsite: job.companyWebsite,
            companyIndustry: job.companyIndustry,
            companyEmployeesCount: job.companyEmployeesCount,
            companyHeadquarters: job.companyHeadquarters,
            companyFounded: job.companyFounded,
            companyType: job.companyType,
            companyDescription: job.companyDescription,
            jobTitle: job.title,
            jobDescription: job.descriptionText,
            jobLocation: job.location,
            jobPostedAt: job.postedAt,
            jobEmploymentType: job.employmentType,
            jobFunction: job.jobFunction,
            jobApplicants: job.applicantsCount,
            jobLink: job.link,
            otherOpenRoles: matches.length > 1 ? matches.length - 1 : 0,
        };
    });
};

export const buildFileName = (jobId, format) => {
    const date = new Date().toISOString().split('T')[0];
    return `leads-${date}-${jobId.slice(0, 8)}.${format}`;
};