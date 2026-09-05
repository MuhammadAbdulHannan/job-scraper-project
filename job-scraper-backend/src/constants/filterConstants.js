export const EMPLOYEE_MATCH_MODE = {
    OVERLAP: 'overlap',
    CONTAINED: 'contained',
};

export const DEFAULT_EMPLOYEE_MATCH_MODE = EMPLOYEE_MATCH_MODE.CONTAINED;

export const STAFFING_MATCH_FIELDS = ['companyName', 'companyDomain', 'companyIndustry'];

export const DEFAULT_STAFFING_WORDS = [
    'staff', 'staffing', 'staffed', 'recruit', 'recruits', 'recruiter',
    'recruiters', 'recruiting', 'recruitment', 'headhunter', 'headhunters',
    'headhunting', 'personnel', 'employment', 'placement', 'placements',
    'manpower', 'workforce', 'resourcing', 'temp', 'temps', 'temping',
    'hr', 'human resources', 'talent acquisition', 'executive search',
];

export const REMOVAL_REASON = {
    NO_COMPANY_DATA: 'missing_company_data',
    EMPLOYEE_RANGE: 'employee_count_out_of_range',
    STAFFING_WORD: 'staffing_word_match',
    KEYWORD_MISMATCH: 'no_keyword_match',
};

export const STRIPPED_JOB_FIELDS = [
    'descriptionHtml', 'trackingId', 'refId', 'companyLogo',
    'attributes', 'attributesWithKeys', 'companyHeaderImage', 'companyCeoPhoto', 'occupations', 'occupationsWithKeys', 'attributesWithKeys', 'attributes',
    'companyHeaderImage', 'companyCeoPhoto', 'companyLogo',
];

export const MATCH_IN = {
    TITLE: 'title',
    DESCRIPTION: 'description',
};

export const MATCH_IN_FIELD_MAP = {
    [MATCH_IN.TITLE]: 'title',
    [MATCH_IN.DESCRIPTION]: 'descriptionText',
};

export const DEFAULT_MATCH_IN = [MATCH_IN.TITLE];