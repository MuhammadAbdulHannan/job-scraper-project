import { EMPLOYEE_MATCH_MODE, STRIPPED_JOB_FIELDS } from '../constants/filterConstants.js';
import { PLATFORMS } from '../constants/apifyConstants.js';

// '51-200 employees' -> { min: 51, max: 200 }
// '10,001+ employees' -> { min: 10001, max: Infinity }
export const parseEmployeeCount = (raw) => {
    if (!raw) return null;
    const cleaned = String(raw).replace(/,/g, '');

    const range = cleaned.match(/(\d+)\s*(?:-|–|to)\s*(\d+)/i);
    if (range) return { min: Number(range[1]), max: Number(range[2]) };

    const plus = cleaned.match(/(\d+)\s*\+/);
    if (plus) return { min: Number(plus[1]), max: Infinity };

    const single = cleaned.match(/(\d+)/);
    if (single) return { min: Number(single[1]), max: Number(single[1]) };

    return null;
};

export const isWithinEmployeeRange = (raw, min, max, mode) => {
    const bucket = parseEmployeeCount(raw);
    if (!bucket) return false;

    const lowerBound = min ?? 0;
    const upperBound = max ?? Infinity;

    if (mode === EMPLOYEE_MATCH_MODE.CONTAINED) {
        return bucket.min >= lowerBound && bucket.max <= upperBound;
    }

    return bucket.min <= upperBound && bucket.max >= lowerBound;
};

// whole-word match; dots and hyphens count as breaks
export const findStaffingWord = (text, words) => {
    if (!text) return null;
    const normalized = ` ${String(text).toLowerCase().replace(/[^a-z0-9+#]+/g, ' ').trim()} `;
    return words.find((word) => normalized.includes(` ${word.toLowerCase()} `)) || null;
};

export const stripJobFields = (job) => {
    const cleaned = { ...job };
    STRIPPED_JOB_FIELDS.forEach((field) => delete cleaned[field]);
    return cleaned;
};


// unique companies, so we classify (and later look up contacts) once per company
export const groupByCompany = (jobs) => {
    const companies = new Map();

    jobs.forEach((job) => {
        const key = job.companyDomain || job.companyName;
        if (!key) return;

        if (!companies.has(key)) {
            companies.set(key, {
                key,
                companyName: job.companyName,
                companyDomain: job.companyDomain,
                companyWebsite: job.companyWebsite,
                companyIndustry: job.companyIndustry,
                companyDescription: job.companyDescription,
                companyEmployeesCount: job.companyEmployeesCount,
                companyLinkedinUrl: job.companyLinkedinUrl,
                jobs: [],
            });
        }

        companies.get(key).jobs.push({
            id: job.id,
            title: job.title,
            link: job.link,
            location: job.location,
            postedAt: job.postedAt,
            salaryInfo: job.salaryInfo,
        });
    });

    return [...companies.values()];
};


const normalizeIndeedJob = (job) => ({
    id: job.jobKey,
    title: job.title,
    link: job.url,
    applyUrl: job.originalApplyUrl,
    location: job.jobLocationShort || job.jobLocationFull,
    postedAt: job.datePublishedClean,
    descriptionText: job.description,
    employmentType: null,
    salaryInfo: job.salaryFormatted,
    companyName: job.company,
    companyWebsite: job.companyWebsite,
    companyDomain: job.companyDomain,
    companyIndustry: job.companyIndustry || job.companyIndustryRaw,
    companyEmployeesCount: job.companyEmployeeRange,
    companyDescription: job.companyDescription || job.companyBriefDescription,
    companyHeadquarters: job.companyAddressFull,
    companyCeoName: job.companyCeoName,
    companyRating: job.companyRating,
    companyRevenue: job.companyRevenue,
    platform: PLATFORMS.INDEED,
});

const normalizeLinkedinJob = (job) => ({ ...job, platform: PLATFORMS.LINKEDIN });

export const normalizeJob = (job, platform) =>
    platform === PLATFORMS.INDEED ? normalizeIndeedJob(job) : normalizeLinkedinJob(job);