// src/controllers/auth.controller.ts
// src/controllers/auth.controller.ts
import type { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service.js'

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const result = await authService.sendOtp(email);
    res.json(result);
  } catch (err: any) {
    next(err);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyOtp(email, otp);
    res.json(result);
  } catch (err: any) {
    next(err);
  }
};
