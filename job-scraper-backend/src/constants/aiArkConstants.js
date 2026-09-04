export const AIARK_BASE_URL = 'https://api.ai-ark.com/api/developer-portal';

export const AIARK_ENDPOINTS = {
    CREDITS: '/v1/payments/credits',
    COMPANY_SEARCH: '/v1/companies',
    PEOPLE_SEARCH: '/v1/people',
    PEOPLE_EXPORT: '/v1/people/export',
    EXPORT_STATISTICS: (trackId) => `/v1/people/export/${trackId}/statistics`,
    EXPORT_INQUIRIES: (trackId) => `/v1/people/export/${trackId}/inquiries`,
    MOBILE_FINDER: '/v1/people/mobile-phone-finder',
};

// max contacts to keep per company
export const MAX_CONTACTS_PER_COMPANY = 2;

// AI-Ark allows 5 req/sec — stay well under
export const AIARK_BATCH_SIZE = 3;
export const AIARK_BATCH_DELAY_MS = 1000;

export const CONTACT_LOOKUP_STATE = {
    PENDING: 'pending',
    DONE: 'done',
    FAILED: 'failed',
};