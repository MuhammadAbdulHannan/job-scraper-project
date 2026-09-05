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
    FILTERING: 'filtering',
    CLASSIFYING: 'classifying',
    FINDING_CONTACTS: 'finding_contacts',
    READY: 'ready',
    EMPTY: 'empty',
    FAILED: 'failed',
};

export const JOB_STATUS_LABELS = {
    pending: 'Queued',
    scraping: 'Scraping job listings',
    filtering: 'Filtering companies',
    classifying: 'Removing staffing agencies',
    finding_contacts: 'Finding contacts',
    ready: 'Ready to download',
    empty: 'No contacts found',
    failed: 'Failed',
};

export const DEFAULT_STAFFING_WORDS = [
    'staff', 'staffing', 'staffed', 'recruit', 'recruits', 'recruiter',
    'recruiters', 'recruiting', 'recruitment', 'headhunter', 'headhunters',
    'headhunting', 'personnel', 'employment', 'placement', 'placements',
    'manpower', 'workforce', 'resourcing', 'temp', 'temps', 'temping',
    'hr', 'human resources', 'humanresources',
];

export const APIFY_RUN_STATUS = {
    RUNNING: 'RUNNING',
    SUCCEEDED: 'SUCCEEDED',
    FAILED: 'FAILED',
    ABORTED: 'ABORTED',
    TIMED_OUT: 'TIMED-OUT',
};

export const APIFY_TERMINAL_STATUSES = ['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'];

export const POSTED_WITHIN = {
    ANY: 'any',
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
};

// LinkedIn wants r-prefixed seconds, Indeed wants a day count as a string
export const POSTED_WITHIN_MAP = {
    [POSTED_WITHIN.ANY]: { linkedin: '', indeed: '0' },
    [POSTED_WITHIN.DAY]: { linkedin: 'r86400', indeed: '1' },
    [POSTED_WITHIN.WEEK]: { linkedin: 'r604800', indeed: '7' },
    [POSTED_WITHIN.MONTH]: { linkedin: 'r2592000', indeed: '30' },
};

export const POSTED_WITHIN_LABELS = {
    any: 'Any time',
    day: 'Past 24 hours',
    week: 'Past week',
    month: 'Past month',
};