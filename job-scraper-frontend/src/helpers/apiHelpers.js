import { API_BASE_URL } from '../constants/statusConstants.js';

const request = async (path, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || `Request failed (${response.status})`);
    }

    return data;
};

export const startScrape = (payload) =>
    request('/scrape', { method: 'POST', body: JSON.stringify(payload) });

export const fetchJobStatus = (jobId) => request(`/job-status/${jobId}`);

export const buildDownloadUrl = (jobId, format) =>
    `${API_BASE_URL}/download/${jobId}?format=${format}`;