
import express from 'express';
import {checkUser, sendOtp, verifyOtp } from '../controllers/auth.controller.js';

const router = express.Router();

// RESTful endpoints
router.post('/auth/otp', sendOtp);        // Request OTP
router.post('/auth/user', checkUser);
router.post('/auth/verify', verifyOtp);   // Verify OTP & get JWT

export default router;

