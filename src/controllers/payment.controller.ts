import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import paymentService from "../services/payment.service.js";

export class PaymentController {

    async createPaymentIntent (req: AuthRequest, res: Response) {
        try {
            const { amount } = req.body;
            if (!amount) return res.status(400).json({ error: 'amount is required (in cents)' });    
        
            const client_secret  = await paymentService.createPaymentIntent(amount);
            res.json({ clientSecret: client_secret });

        } catch (err: any) {
        console.error('create-payment-intent error', err);
        res.status(500).json({ error: err.message });
        }
    }
    async processPayment (req: AuthRequest, res: Response){
    
        try {
            const { id: userId } = req.user!;
            const result = await paymentService.processPaymentData(req.body, userId);
            res.status(201).json({ 
                success: true, 
                payment_intent_id: result.payment.payment_intent_id,
                message: "Payment recorded and consult updated successfully",
                ...result, 
            });
            
        } catch (err: any) {
            console.error("process-payment error", err);
            res.status(500).json({ error: err.message });
        }
     }
}