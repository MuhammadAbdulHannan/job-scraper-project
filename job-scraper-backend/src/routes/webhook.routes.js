import express from 'express';
import { handleApifyWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

router.post('/apify-webhook', handleApifyWebhook);

export default router;