import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.js";
import prisma from '../prisma.js';
import { logger } from "./logger.js";
import { UserRole } from "@prisma/client";
import authService from "../services/auth.service.js";

export const auditLog = (action: string, objectType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      // Log after successful response
      if (req.user && res.statusCode < 400) {
        const objectId = req.params.id || body?.id || body?.payment?.consult_id;
        const paymentIntentId =
          body?.payment_intent_id ||
          body?.payment?.payment_intent_id ||           
          null;
        const autoDeclinedConsults = body?.declinedconsults;
        prisma.auditLog
          .create({
            data: {
              actor_id: req.user.id ?? authService.getSystemID() ,
              actor_role: req.user.role ?? UserRole.SYSTEM,
              action,              
              object_type: objectType,
              object_id: objectId || "",
              ip: req.ip ?? null,
              metadata_json: {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                payment_intent_id: paymentIntentId,
                timed_out_consult_ids: autoDeclinedConsults ?? []
              },
            },
          })
          .catch((err) => logger.error("Audit log failed:", err));
      }

      return originalJson(body);
    };

    next();
  };
};
