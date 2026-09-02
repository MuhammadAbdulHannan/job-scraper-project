import express from 'express';
import axios from 'axios';
import { getJobStatus, startScrape } from '../controllers/scrape.controller.js';

const router = express.Router();

router.post('/scrape', startScrape);
router.get('/job-status/:jobId', getJobStatus);

export default router;