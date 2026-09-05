import { PIPELINE_STAGES, STAGE_STATE, JOB_STATUS } from '../constants/statusConstants.js';

// where the current status sits in the pipeline
export const getStageState = (stageStatus, currentStatus) => {
    const order = PIPELINE_STAGES.map((stage) => stage.status);
    const stageIndex = order.indexOf(stageStatus);
    const currentIndex = order.indexOf(currentStatus);

    if (currentIndex > stageIndex) return STAGE_STATE.DONE;
    if (currentIndex === stageIndex) {
        return stageStatus === JOB_STATUS.READY ? STAGE_STATE.DONE : STAGE_STATE.ACTIVE;
    }
    return STAGE_STATE.WAITING;
};

export const isRunning = (status) =>
    status && status !== JOB_STATUS.READY && status !== JOB_STATUS.FAILED;

export const formatElapsed = (startIso, endIso) => {
    if (!startIso) return '0s';

    const start = new Date(startIso).getTime();
    const end = endIso ? new Date(endIso).getTime() : Date.now();
    const seconds = Math.max(0, Math.floor((end - start) / 1000));

    const minutes = Math.floor(seconds / 60);
    return minutes ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
};

export const splitToList = (value) =>
    value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

export const validateForm = (values) => {
    const errors = {};

    if (!values.keywords.length) errors.keywords = 'Add at least one keyword';
    if (!values.platforms.length) errors.platforms = 'Pick at least one platform';
    if (!values.personaTitles.length) errors.personaTitles = 'Add at least one title to search for';

    if (Number(values.employeeCountMin) > Number(values.employeeCountMax)) {
        errors.employeeCount = 'Minimum is larger than maximum';
    }

    if (values.filterKeywords.length && !values.filterMatchIn.length) {
        errors.filterMatchIn = 'Pick at least one place to look';
    }

    return errors;
};

