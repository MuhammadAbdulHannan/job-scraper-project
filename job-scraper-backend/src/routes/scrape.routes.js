import express from 'express';
import axios from 'axios';
import { getJobStatus, startScrape } from '../controllers/scrape.controller.js';
import { downloadResults } from '../controllers/export.controller.js';

const router = express.Router();

router.post('/scrape', startScrape);
router.get('/job-status/:jobId', getJobStatus);
router.get('/download/:jobId', downloadResults);


export default router;