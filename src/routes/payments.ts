import express from 'express';
import type { Request, Response } from 'express';

import Stripe from 'stripe';
import  prisma  from '../prisma.js';
import { ConsultStatus, Prisma } from '@prisma/client';
import { ConsultService } from '../services/consults.service.js';
import { PaymentController } from '../controllers/payment.controller.js';
import { auditLog } from '../middleware/auditLog.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { createConsultSchema, paymentSchema } from '../middleware/validator.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const paymentController = new PaymentController();
/**
 * POST /create-payment-intent
 * Creates a Stripe PaymentIntent and returns the client secret
 */
router.post('/create-payment-intent', authenticate, paymentController.createPaymentIntent);

router.post("/process-payment", 
  validate(paymentSchema),
  authenticate,
  auditLog("Authorize", "Payment"),  
  paymentController.processPayment);


export default router;
