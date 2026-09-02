export const APIFY_BASE_URL = 'https://api.apify.com/v2';

export const ACTOR_IDS = {
    // Apify uses ~ instead of / in API URLs for actor IDs.
    LINKEDIN: 'claygenius~cheapest-linkedin-job-scrapper',
    INDEED: 'claygenius~best-cheapest-indeed-job-scrapper',
};

export const AI_AGENCY_FILTER = {
    OFF: 'off',
    FLAG_ONLY: 'flagAgenciesOnly',
    REMOVE: 'removeAgencies',
};

export const PLATFORMS = {
    LINKEDIN: 'linkedin',
    INDEED: 'indeed',
};

export const JOB_STATUS = {
    PENDING: 'pending',
    SCRAPING: 'scraping',
    PROCESSING: 'processing',
    DONE: 'done',
    FAILED: 'failed',
};

export const DEFAULT_STAFFING_WORDS = [
    'staff', 'staffing', 'staffed', 'recruit', 'recruits', 'recruiter',
    'recruiters', 'recruiting', 'recruitment', 'headhunter', 'headhunters',
    'headhunting', 'personnel', 'employment', 'placement', 'placements',
    'manpower', 'workforce', 'resourcing', 'temp', 'temps', 'temping',
    'hr', 'human resources', 'humanresources',
];