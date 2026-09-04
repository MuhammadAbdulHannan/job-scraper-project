import {
    DEFAULT_STAFFING_WORDS,
    STAFFING_MATCH_FIELDS,
    DEFAULT_EMPLOYEE_MATCH_MODE,
    REMOVAL_REASON,
} from '../constants/filterConstants.js';
import { isWithinEmployeeRange, findStaffingWord } from '../helpers/jobHelpers.js';

export const applyRuleFilters = (jobs, options = {}) => {
    const {
        employeeCountMin,
        employeeCountMax,
        staffingWords = DEFAULT_STAFFING_WORDS,
        matchMode = DEFAULT_EMPLOYEE_MATCH_MODE,
    } = options;

    const kept = [];
    const removed = [];

    jobs.forEach((job) => {
        if (!job.companyName) {
            removed.push({ companyName: null, reason: REMOVAL_REASON.NO_COMPANY_DATA });
            return;
        }

        if (employeeCountMin || employeeCountMax) {
            const inRange = isWithinEmployeeRange(
                job.companyEmployeesCount,
                employeeCountMin,
                employeeCountMax,
                matchMode
            );

            if (!inRange) {
                removed.push({
                    companyName: job.companyName,
                    reason: REMOVAL_REASON.EMPLOYEE_RANGE,
                    detail: job.companyEmployeesCount || 'unknown',
                });
                return;
            }
        }

        const matchedField = STAFFING_MATCH_FIELDS.find((field) =>
            findStaffingWord(job[field], staffingWords)
        );

        if (matchedField) {
            removed.push({
                companyName: job.companyName,
                reason: REMOVAL_REASON.STAFFING_WORD,
                detail: `${matchedField}: ${findStaffingWord(job[matchedField], staffingWords)}`,
            });
            return;
        }

        kept.push(job);
    });

    return { kept, removed };
};