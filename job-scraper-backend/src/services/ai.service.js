import axios from 'axios';
import {
    OPENAI_API_URL,
    PERPLEXITY_API_URL,
    OPENAI_MODEL,
    PERPLEXITY_MODEL,
    CLASSIFIER_SYSTEM_PROMPT,
} from '../constants/aiConstants.js';

const parseJsonResponse = (raw) => {
    const cleaned = String(raw).replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.reason) {
        parsed.reason = parsed.reason.replace(/\[\d+\]/g, '').trim();
    }
    return parsed;
};

export const classifyWithGpt = async ({ companyName, companyIndustry, companyDescription }) => {
    const userPrompt = [
        `Company: ${companyName}`,
        companyIndustry ? `Industry: ${companyIndustry}` : null,
        `Description: ${companyDescription}`,
    ].filter(Boolean).join('\n');

    const response = await axios.post(
        OPENAI_API_URL,
        {
            model: OPENAI_MODEL,
            messages: [
                { role: 'system', content: CLASSIFIER_SYSTEM_PROMPT },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0,
            response_format: { type: 'json_object' },
        },
        {
            headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        }
    );

    return parseJsonResponse(response.data.choices[0].message.content);
};

export const classifyWithPerplexity = async ({ companyName, companyWebsite, companyIndustry }) => {
    const userPrompt = [
        `Visit ${companyWebsite} and determine whether ${companyName} is a staffing agency, `,
        `recruitment firm, or headhunter, or whether it is a company hiring for its own team.`,
        companyIndustry ? ` Their listed industry is: ${companyIndustry}.` : '',
    ].join('');

    const response = await axios.post(
        PERPLEXITY_API_URL,
        {
            model: PERPLEXITY_MODEL,
            messages: [
                { role: 'system', content: CLASSIFIER_SYSTEM_PROMPT },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0,
        },
        {
            headers: { Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}` },
        }
    );

    return parseJsonResponse(response.data.choices[0].message.content);
};