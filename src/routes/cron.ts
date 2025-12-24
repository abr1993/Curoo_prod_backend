
import express from 'express';
import { autoDeclineConsults } from '../controllers/cron.controller.js';
import { auditLog } from '../middleware/auditLog.js';

const router = express.Router();

// RESTful endpoints
router.get('/cron/auto-decline-consults', auditLog("ACCEPT", "consult"), autoDeclineConsults);        // Auto decline consults



export default router;

