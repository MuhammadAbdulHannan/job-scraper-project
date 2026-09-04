export const EXPORT_FORMAT = {
    XLSX: 'xlsx',
    CSV: 'csv',
};

export const MIME_TYPES = {
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
};

// column order and headers for the export
export const EXPORT_COLUMNS = [
    { key: 'fullName', header: 'Full Name', width: 22 },
    { key: 'title', header: 'Job Title', width: 32 },
    { key: 'seniority', header: 'Seniority', width: 12 },
    { key: 'department', header: 'Department', width: 22 },
    { key: 'email', header: 'Email', width: 28 },
    { key: 'emailStatus', header: 'Email Status', width: 13 },
    { key: 'emailDomainType', header: 'Email Type', width: 12 },
    { key: 'emailIsGeneric', header: 'Generic Email', width: 13 },
    { key: 'mobilePhone', header: 'Mobile Phone', width: 16 },
    { key: 'linkedinUrl', header: 'LinkedIn Profile', width: 45 },
    { key: 'location', header: 'Contact Location', width: 26 },
    { key: 'companyName', header: 'Company', width: 20 },
    { key: 'companyDomain', header: 'Company Domain', width: 22 },
    { key: 'companyWebsite', header: 'Company Website', width: 30 },
    { key: 'companyIndustry', header: 'Company Industry', width: 26 },
    { key: 'companyEmployeesCount', header: 'Company Size', width: 17 },
    { key: 'companyHeadquarters', header: 'Company HQ', width: 24 },
    { key: 'companyFounded', header: 'Founded', width: 10 },
    { key: 'companyType', header: 'Company Type', width: 16 },
    { key: 'companyDescription', header: 'Company Description', width: 60 },
    { key: 'jobTitle', header: 'Source Job Title', width: 36 },
    { key: 'jobLocation', header: 'Job Location', width: 20 },
    { key: 'jobPostedAt', header: 'Job Posted', width: 13 },
    { key: 'jobEmploymentType', header: 'Employment Type', width: 16 },
    { key: 'jobFunction', header: 'Job Function', width: 30 },
    { key: 'jobApplicants', header: 'Applicants', width: 14 },
    { key: 'jobLink', header: 'Job URL', width: 42 },
    { key: 'otherOpenRoles', header: 'Other Open Roles', width: 16 },
];

export const HEADER_FILL = '1F3864';
export const EXPORT_FONT = 'Arial';