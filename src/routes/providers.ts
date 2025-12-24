
import express from 'express';
import { ProviderController } from '../controllers/provider.controller.js';
import { auditLog } from '../middleware/auditLog.js';
import { authenticate } from '../middleware/auth.js';
//import { upload } from '../middleware/upload.js';

const router = express.Router();
const providerController = new ProviderController();
// GET /api/providers → list all providers
// src/routes/providers.ts

// 1. LIST/GENERAL (usually fine at the top)
router.get('/providers', providerController.list);

// 2. SPECIFIC ROUTES (These must come first)
router.get('/providers/settings', authenticate, providerController.getSettings); // Your specific route
router.put("/providers/settings", authenticate, auditLog("UPDATE", "settings"), providerController.updateSettings);
//router.post("/providers/settings/upload-photo", authenticate,  upload.single("photo"),  providerController.uploadPhoto);


// 3. DYNAMIC ROUTES (These must come after the specific ones)
// GET /api/providers/:id → get a provider by user_id
router.get('/providers/:id', providerController.get);
router.get('/providers/:id/licenses', providerController.getSpecialtyLicenses);
router.get('/providers/:id/:providerspecialtyId', providerController.getBySpecialty);





export default router;
