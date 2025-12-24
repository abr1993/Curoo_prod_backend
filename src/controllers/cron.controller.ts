// src/controllers/auth.controller.ts
// src/controllers/auth.controller.ts
import type { Request, Response, NextFunction } from 'express';
import expireConsults from '../services/expireConsults.service.js'

export const autoDeclineConsults = async (req: Request, res: Response, next: NextFunction) => {
    try {
    // Optional: simple shared secret protection
    const token = req.headers["x-cron-token"];
    /* if (token !== process.env.CRON_SECRET) {
      return res.status(401).json({ message: "Unauthorized" });
    } */

    const declinedconsults = await expireConsults.expireOldConsults();

    return res.status(200).json({
      success: true,
      declinedconsults,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Auto-decline cron failed:", error);
    return res.status(500).json({ message: "Cron execution failed" });
  }
 
};


