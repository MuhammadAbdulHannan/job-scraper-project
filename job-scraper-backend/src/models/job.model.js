import mongoose from 'mongoose';
import { JOB_STATUS } from '../constants/apifyConstants.js';

const jobSchema = new mongoose.Schema(
    {
        jobId: { type: String, required: true, unique: true, index: true },
        status: {
            type: String,
            enum: Object.values(JOB_STATUS),
            default: JOB_STATUS.PENDING,
        },
        inputs: {
            keywords: [String],
            location: String,
            employeeCountMin: Number,
            employeeCountMax: Number,
            personaTitles: [String],
            platforms: [String],
            jobsPerKeyword: Number,
        },
        apifyRuns: [
            {
                runId: String,
                platform: String,
                keyword: String,
                status: String,
            },
        ],
        scrapedJobs: { type: Array, default: [] },
        resultFilePath: { type: String, default: null },
        error: { type: String, default: null },
    },
    { timestamps: true }
);

export default mongoose.model('Job', jobSchema);