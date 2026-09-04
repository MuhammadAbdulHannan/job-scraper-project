import Job from '../models/job.model.js';
import { generateXlsxBuffer, generateCsvBuffer } from '../services/export.service.js';
import { buildExportRows, buildFileName } from '../helpers/exportHelpers.js';
import { EXPORT_FORMAT, MIME_TYPES } from '../constants/exportConstants.js';
import { JOB_STATUS } from '../constants/apifyConstants.js';

export const downloadResults = async (req, res) => {
    try {
        const { jobId } = req.params;
        const format = (req.query.format || EXPORT_FORMAT.XLSX).toLowerCase();

        if (!Object.values(EXPORT_FORMAT).includes(format)) {
            return res.status(400).json({ error: 'Format must be xlsx or csv' });
        }

        const job = await Job.findOne({ jobId });
        if (!job) return res.status(404).json({ error: 'Job not found' });

        if (job.status !== JOB_STATUS.READY) {
            return res.status(409).json({
                error: 'Results are not ready yet',
                status: job.status,
            });
        }

        const rows = buildExportRows(job.contacts, job.filteredJobs);

        if (!rows.length) {
            return res.status(404).json({ error: 'No contacts found for this job' });
        }

        const fileName = buildFileName(jobId, format);

        const buffer =
            format === EXPORT_FORMAT.CSV
                ? generateCsvBuffer(rows)
                : await generateXlsxBuffer(rows, {
                    ...job.inputs.toObject?.() ?? job.inputs,
                    scrapedCount: job.scrapedJobs.length,
                    filteredCount: job.filteredJobs.length,
                    companiesCount: job.cleanedCompanies.length,
                });

        res.setHeader('Content-Type', MIME_TYPES[format]);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', Buffer.byteLength(buffer));
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('Export failed:', error.message);
        res.status(500).json({ error: error.message });
    }
};