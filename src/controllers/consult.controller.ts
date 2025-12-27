// src/controllers/consult.controller.ts
// src/controllers/consult.controller.ts
import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import consultService from "../services/consults.service.js";
import { notificationService } from "../services/notification.service.js";
import authService from "../services/auth.service.js";

export class ConsultController {
  async list(req: AuthRequest, res: Response) {
    try{
      const { role, id: userId } = req.user!;
      const consults = await consultService.list(userId, role);
      res.json(consults);
    }catch(err:any){
       res.status(500).json({ error: err.message || "Consult not found" });
    }
    
  }

  async getConsultProvider(req: AuthRequest, res: Response) {
    const { id} = req.params;
    if (!id) {
        return res.status(400).json({ error: "Consult ID is required" });
    }
    try{
      
      const provider = await consultService.getProviderByConsultId(id);
      res.json(provider);
    }catch(err:any){
       res.status(500).json({ error: err.message || "provider not found" });
    }
    
  }

  async getById(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const {role} = req.user!;
      
    const linkToken = req.query.linkToken as string | undefined;
   
    if (!id) {
        return res.status(400).json({ error: "Consult ID is required" });
    }
    try {
      const consult = await consultService.getConsultById(id, role); 
        // ✅ CASE 1: Normal in-app access
        if (consult.patient.id === req.user?.id || consult.provider.id === req.user?.id) {
          return res.json(consult);
        }

        // ✅ CASE 2: Access via signed email link
        if (linkToken && linkToken !== "null" ) {
          if (linkToken !== undefined && authService.isVerifiedConsultLink(linkToken, consult.id, req.user!.id)){
              return res.json(consult);
          }
          
        }

        // ❌ FAIL: Not owner + no valid link
        return res.status(403).json({ message: "Access denied" });     
      //res.json(consult);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Consult not found" });
    }
    
    }
  async getReport(req: AuthRequest, res: Response, ) {
    const { id } = req.params;
    const {role} = req.user!;
   
    if (!id) {
        return res.status(400).json({ error: "Consult ID is required" });
    }
    try {
      const consult = await consultService.getReport(id);      
      if (!consult) {
        return res.status(404).json({ error: "Consult not found" });
      }
      res.json(consult);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Server error" });
    }
    
    }


  async create(req: AuthRequest, res: Response) {
    try{
      const consult = await consultService.createConsult(req.body);
      /* if(consult){
        await notificationService.sendConsult({
          templateName: "CONSULT_SUBMITTED",
          recipient: consult.provider_id,
          consultID: consult.id,          
          senderId: consult.provider_id
        });
      } */
      res.status(201).json(consult);
    }catch(err:any){
        res.status(500).json({ error: err.message || "Server error" });
    }
    
  }
  async updateConsult(req: AuthRequest, res: Response) {
    try{
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: "Consult ID is required" });
      const consult = await consultService.updateConsult(req.body, id);
      res.status(201).json(consult);
    }catch(err:any){
        res.status(500).json({ error: err.message || "Server error" });
    }
    
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!id) return res.status(400).json({ error: "Consult ID is required" });
        const { role, id: userId } = req.user!;
        const consult = await consultService.update(id,userId, status);
        res.json(consult);
        } catch (err:any) {
          res.status(500).json({ error: err.message || "Server error" });
           next(err);
        }
   }


  async accept(req: AuthRequest, res: Response) {
    try{
        const { id } = req.params;
        if (!id) {
          return res.status(400).json({ error: "Consult ID is required" });
        }

        const result = await consultService.accept(id);

        if (result.status !== "succeeded") {
          return res.status(400).json({
            error: "Payment capture not successful",
            payment_intent_id: result.payment_intent_id,
            status: result.status,
          });
        }
        res.json({
            ...result.consult,
            payment_intent_id: result.payment_intent_id,
            status: result.status,
          });
      }catch(err:any){
        res.status(500).json({ error: err.message || "Server error" });
      }
  
}

async saveDraft(req: AuthRequest, res: Response){
    const { id } = req.params;
    const { id: userId } = req.user!;
    if (!id) {
      return res.status(400).json({ error: "Consult ID is required" });
    }

    // extract report fields from request body
    const {
      overview,
      differentials_general,
      self_care_general,
      when_to_seek_care,
          
    } = req.body;

    try {
      // pass everything to the service
      const consult = await consultService.answer(id, userId, {
        overview,
        differentials_general,
        self_care_general,
        when_to_seek_care,       
        
      });

      res.json(consult);
    } catch (error) {
      console.error("Error answering consult:", error);
      res.status(500).json({ error: "Failed to answer consult" });
    }

}

async answer(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { id: userId } = req.user!;
  if (!id) {
    return res.status(400).json({ error: "Consult ID is required" });
  }

  // extract report fields from request body
  const {
    overview,
    differentials_general,
    self_care_general,
    when_to_seek_care,
        
  } = req.body;

  try {
    // pass everything to the service
    const consult = await consultService.answer(id, userId, {
      overview,
      differentials_general,
      self_care_general,
      when_to_seek_care,      
    }, false);

    res.json(consult);
  } catch (error) {
    console.error("Error answering consult:", error);
    res.status(500).json({ error: "Failed to answer consult" });
  }
  /* const consult = await consultService.answer(id);
  res.json(consult); */
}

async decline(req: AuthRequest, res: Response) {
  try{
      const { id } = req.params;
      const { id: userId } = req.user!;
      if (!id) {
        return res.status(400).json({ error: "Consult ID is required" });
      }
      console.log("id, user id", id, userId);

      //const { auto_decline } = req.body;
      const result = await consultService.decline(id, userId);
      if (result.paymentIntentStatus !== "canceled") {
          return res.status(400).json({
            error: "Payment decline not successful",
            payment_intent_id: result.payment_intent_id,
            status: result.paymentIntentStatus,
          });
        }
        res.json({
            ...result.consult,
            payment_intent_id: result.payment_intent_id,
            status: result.paymentIntentStatus,
          });
      
  }catch(err:any){
    console.error(err); 
    res.status(500).json({ error: "Failed to decline consult" });
  }
  
}

async delete(req: AuthRequest, res: Response) {
  try{
    const { id } = req.params;
    const { id: userId } = req.user!;
    if (!id) {
      return res.status(400).json({ error: "Consult ID is required" });
    }  
    const consult = await consultService.delete(id, userId);
    res.json(consult);
  }catch(err:any){
    res.status(500).json({ error: "Failed to delete consult" });
  }
  
}

}
