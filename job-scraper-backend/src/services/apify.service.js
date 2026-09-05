import axios from 'axios';
import { APIFY_BASE_URL, ACTOR_IDS, PLATFORMS, AI_AGENCY_FILTER, POSTED_WITHIN, POSTED_WITHIN_MAP } from '../constants/apifyConstants.js';

const apifyHeaders = () => ({
    Authorization: `Bearer ${process.env.APIFY_TOKEN}`,
});

// Builds the input object each actor expects
const buildActorInput = (platform, { keyword, location, jobsPerKeyword, postedWithin }) => {
    const dateWindow = POSTED_WITHIN_MAP[postedWithin] || POSTED_WITHIN_MAP[POSTED_WITHIN.ANY];
    if (platform === PLATFORMS.LINKEDIN) {
        return {
            keyword,
            location,
            maxItems: jobsPerKeyword,
            postedWithin: dateWindow.linkedin,
            fetchDetails: true,
            fetchCompanyDetails: true,
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
            postedWithinDays: dateWindow.indeed,
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