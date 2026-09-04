import axios from 'axios';
import { APIFY_BASE_URL, ACTOR_IDS, PLATFORMS, AI_AGENCY_FILTER } from '../constants/apifyConstants.js';

const apifyHeaders = () => ({
    Authorization: `Bearer ${process.env.APIFY_TOKEN}`,
});

// Builds the input object each actor expects
const buildActorInput = (platform, { keyword, location, jobsPerKeyword, staffingWords }) => {
    if (platform === PLATFORMS.LINKEDIN) {
        return {
            keyword,
            location,
            maxItems: jobsPerKeyword,
            fetchCompanyDetails: true,
            removeStaffingCompanies: false,
            staffingWords,
            staffingMatchIn: ['company', 'companyDomain', 'companyIndustry'],
            aiAgencyFilter: AI_AGENCY_FILTER.OFF,
            openaiApiKey: process.env.OPENAI_API_KEY,
            proxyConfig: {
                useApifyProxy: true,
                apifyProxyGroups: ['RESIDENTIAL'],
            },
        };
    }

    if (platform === PLATFORMS.INDEED) {
        return {
            keywords: [keyword],
            location,
            country: 'us',
            maxItems: jobsPerKeyword,
            postedWithinDays: '0',
            proxyConfig: {
                useApifyProxy: true,
                apifyProxyGroups: ['RESIDENTIAL'],
            },
        };
    }

    throw new Error(`Unknown platform: ${platform}`);
};

// Triggers one actor run, returns the Apify runId
export const triggerActorRun = async (platform, inputParams, webhookUrl) => {
    console.log('Platform received:', platform);
    console.log("here");
    console.log(inputParams);
    const actorId = ACTOR_IDS[platform.toUpperCase()];
    const input = buildActorInput(platform, inputParams);

    const webhooksParam = Buffer.from(
        JSON.stringify([
            {
                eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
                requestUrl: webhookUrl,
            },
        ])
    ).toString('base64');

    const response = await axios.post(
        `${APIFY_BASE_URL}/acts/${actorId}/runs`,
        input,
        {
            headers: apifyHeaders(),
            params: { webhooks: webhooksParam },
        }
    );

    return response.data.data.id;
};

// Fetches the results of a finished run
export const fetchRunResults = async (runId) => {
    const response = await axios.get(
        `${APIFY_BASE_URL}/actor-runs/${runId}/dataset/items`,
        { headers: apifyHeaders() }
    );
    return response.data;
};