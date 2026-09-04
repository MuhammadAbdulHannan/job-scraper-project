import express from 'express';
import { handleApifyWebhook } from '../controllers/webhook.controller.js';
import { handleAiArkWebhook } from '../controllers/aiarkWebhook.controller.js';

const router = express.Router();

router.post('/apify-webhook', handleApifyWebhook);
router.post('/aiark-webhook', handleAiArkWebhook);

export default router;