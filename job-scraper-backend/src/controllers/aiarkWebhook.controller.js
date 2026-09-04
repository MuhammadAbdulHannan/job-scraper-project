import Job from '../models/job.model.js';
import { collectExportResults, enrichWithPhones } from '../services/contactLookup.service.js';
import { JOB_STATUS } from '../constants/apifyConstants.js';

export const handleAiArkWebhook = async (req, res) => {
    res.status(200).send('OK');

    try {
        const trackId = req.body?.trackId || req.body?.data?.trackId;
        if (!trackId) return;

        const job = await Job.findOne({ 'aiArkExport.trackId': trackId });
        if (!job) {
            console.warn(`No job found for AI-Ark trackId ${trackId}`);
            return;
        }

        let contacts = await collectExportResults(trackId);

        if (job.inputs.needPhone) {
            contacts = await enrichWithPhones(contacts);
        }

        if (!contacts.length) {
            job.status = JOB_STATUS.EMPTY;
            job.emptyReason = 'Companies were found, but nobody at them matched your persona titles. Try broadening the titles.';
            job.aiArkExport.state = 'DONE';
            job.markModified('aiArkExport');
            await job.save();
            return;
        }

        job.contacts = contacts;
        job.aiArkExport.state = 'DONE';
        job.status = JOB_STATUS.READY;
        job.markModified('contacts');
        job.markModified('aiArkExport');
        await job.save();

        console.log(`Job ${job.jobId}: ${contacts.length} contacts collected`);
    } catch (error) {
        console.error('AI-Ark webhook error:', error.message);
    }
};