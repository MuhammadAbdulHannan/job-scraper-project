import { randomUUID } from 'crypto';
import Job from '../models/job.model.js';
import { triggerActorRun } from '../services/apify.service.js';
import { JOB_STATUS, DEFAULT_STAFFING_WORDS } from '../constants/apifyConstants.js';

export const startScrape = async (req, res) => {
    console.log(req.body);
    try {
        const {
            keywords,
            location,
            employeeCountMin,
            employeeCountMax,
            personaTitles,
            platforms,
            jobsPerKeyword,
        } = req.body;

        if (!keywords?.length || !platforms?.length) {
            return res.status(400).json({
                success: false,
                error: "Keywords and platforms are required"
            });
        }

        const jobId = randomUUID();
        const job = await Job.create({
            jobId,
            status: JOB_STATUS.SCRAPING,
            inputs: {
                keywords,
                location,
                employeeCountMin,
                employeeCountMax,
                personaTitles,
                platforms,
                jobsPerKeyword,
            },
        });

        const webhookUrl = `${process.env.PUBLIC_BASE_URL}/api/apify-webhook`;
        const apifyRuns = [];

        // multiple keywords => multiple queries, one per platform
        for (const keyword of keywords) {
            for (const platform of platforms) {
                const runId = await triggerActorRun(
                    platform,
                    {
                        keyword,
                        location,
                        jobsPerKeyword,
                        staffingWords: DEFAULT_STAFFING_WORDS,
                    },
                    webhookUrl
                );

                apifyRuns.push({ runId, platform, keyword, status: 'Running' });
            }
        }

        job.apifyRuns = apifyRuns;
        await job.save();

        res.json({
            success: true,
            jobId,
            status: job.status,
            totalRuns: apifyRuns.length
        });

    }
    catch (error) {
        console.error('Apify error:', error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data?.error?.message || error.message });
    }
};

export const getJobStatus = async (req, res) => {
    try {
        const job = await Job.findOne({ jobId: req.params.jobId });
        if (!job) return res.status(404).json({
            success: false,
            error: 'Job not found'
        });

        res.json({
            success: true,
            jobId: job.jobId,
            status: job.status,
            totalRuns: job.apifyRuns.length,
            completedRuns: job.apifyRuns.filter((r) => r.status !== 'RUNNING').length,
            resultFilePath: job.resultFilePath,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};