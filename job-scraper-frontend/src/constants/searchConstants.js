export const PLATFORMS = [
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'indeed', label: 'Indeed' },
];

export const DEFAULT_FORM_VALUES = {
    keywords: [],
    location: '',
    platforms: ['linkedin'],
    jobsPerKeyword: 25,
    employeeCountMin: 50,
    employeeCountMax: 500,
    personaTitles: [],
    postedWithin: 'week',
    filterKeywords: [],
    filterMatchIn: ['title'],
    needEmail: true,
    needPhone: false,
};

export const JOBS_PER_KEYWORD_OPTIONS = [2, 10, 25, 50, 100];

export const SUGGESTED_PERSONA_TITLES = [
    'founder',
    'ceo',
    'cto',
    'vp of sales',
    'director of sales',
    'head of talent',
    'hiring manager',
    'recruiter',
];

export const FIELD_HINTS = {
    keywords: 'Each keyword runs as a separate search on every platform you pick.',
    employeeCount:
        'LinkedIn reports company size in bands. A company is included when its band overlaps your range.',
    personaTitles: 'Who to find at each company. Up to two people per company, most senior first.',
    postedWithin: 'Recent postings are a stronger hiring signal and cost less to process.',
    filterKeywords: 'Only keep jobs mentioning at least one of these. Leave empty to keep everything.',
    needPhone: 'Mobile numbers cost roughly ten times as much as emails.',
};

export const POSTED_WITHIN_OPTIONS = [
    { value: 'any', label: 'Any time' },
    { value: 'day', label: 'Past 24 hours' },
    { value: 'week', label: 'Past week' },
    { value: 'month', label: 'Past month' },
];

export const MATCH_IN_OPTIONS = [
    { value: 'title', label: 'Job title' },
    { value: 'description', label: 'Job description' },
];