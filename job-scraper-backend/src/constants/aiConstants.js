export const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
export const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export const OPENAI_MODEL = 'gpt-4o-mini';
export const PERPLEXITY_MODEL = 'sonar';

export const CLASSIFICATION_SOURCE = {
    GPT: 'gpt',
    PERPLEXITY: 'perplexity',
    SKIPPED: 'skipped',
};

export const CLASSIFIER_SYSTEM_PROMPT =
    'You classify companies as staffing agencies or direct employers. ' +
    'A staffing agency, recruitment firm, headhunter, or talent marketplace places ' +
    'candidates at OTHER companies. A direct employer hires for its own team. ' +
    'Respond with JSON only, no markdown: {"isStaffingAgency": true|false, "reason": "<one short sentence>"}';

// how many companies to classify at once
export const AI_BATCH_SIZE = 3;

// delay between batch tests
export const AI_BATCH_DELAY_MS = 2000;