import Job from '../models/job.model.js';
import { fetchRunResults } from '../services/apify.service.js';
import { JOB_STATUS } from '../constants/apifyConstants.js';

export const handleApifyWebhook = async (req, res) => {
    // Respond immediately so Apify doesn't retry while we process
    res.status(200).send('OK');

    try {
        const { eventType, resource } = req.body;
        const runId = resource?.id;

        if (!runId) return;

        // Find which job this run belongs to
        const job = await Job.findOne({ 'apifyRuns.runId': runId });
        if (!job) {
            console.warn(`No job found for runId ${runId}`);
            return;
        }

        const run = job.apifyRuns.find((r) => r.runId === runId);

        if (eventType === 'ACTOR.RUN.SUCCEEDED') {
            const results = await fetchRunResults(runId);
            job.scrapedJobs.push(...results);
            run.status = 'SUCCEEDED';
            console.log(`Run ${runId} finished with ${results.length} jobs`);
        } else if (eventType === 'ACTOR.RUN.FAILED') {
            run.status = 'FAILED';
            console.warn(`Run ${runId} failed`);
        }

        // Check if ALL runs for this job are now finished
        const allDone = job.apifyRuns.every((r) => r.status !== 'RUNNING');

        if (allDone) {
            job.status = JOB_STATUS.PROCESSING;
            console.log(`All runs done for job ${job.jobId}. Total jobs scraped: ${job.scrapedJobs.length}`);
            // next phases (filtering, AI classification, AI-Ark) will hook in here
        }

        job.markModified('apifyRuns');
        job.markModified('scrapedJobs');
        await job.save();
    } catch (error) {
        console.error('Webhook processing error:', error.message);
    }
};