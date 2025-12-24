
import express from 'express';
import { symptoms, conditions, historyFields, getSpecialty, redFlags } from '../controllers/specialty.controller.js';

const router = express.Router();

// GET /api/specialty/:id/symptoms → get symptoms per specialty
router.get('/specialty/:id/symptoms', symptoms);

// GET /api/specialty/:id/historyfields → get symptoms per specialty
router.get('/specialty/:id/historyfields', historyFields);

// GET /api/specialty/:id/conditions→ get conditions per specialty
router.get('/specialty/:id/conditions', conditions);

// GET /api/specialty/:id/conditions→ get conditions per specialty
router.get('/specialty/:id/redflags', redFlags);

router.get('/specialty/:id', getSpecialty);

export default router;

