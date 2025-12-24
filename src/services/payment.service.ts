import Stripe from 'stripe';
import prisma from '../prisma.js';
import { ConsultStatus, NameVisibilityOption, Prisma, Pronoun, SexAtBirth, UserRole } from '@prisma/client';
import type { PaymentRequestBody } from '../middleware/validator.js';
import { ConsultService } from './consults.service.js';
import { notificationService } from './notification.service.js';
import authService from './auth.service.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
// types/payment.ts


export class PaymentService {
    //consultService = new ConsultService();
    async createPaymentIntent(amount: any) {
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Number(amount),
            currency: 'usd',
            capture_method: 'manual',
            
            //automatic_payment_methods: { enabled: true },
            payment_method_types: [
                'card',
                /* 'cashapp',
                'amazon_pay',
                'alipay',
                'afterpay_clearpay', */
            ],
        });

        return paymentIntent.client_secret;
    }
    async processPaymentData(input: PaymentRequestBody, userId: string){
        const {
            consult_id,
            payment_intent_id, // same value stored in both fields
            amount,
            preauth_date,
            captured_date,
            refunded_date,
            refund_reason,
            created_by,
            } = input;
            

            // 💰 Normalize amount safely (cents or decimal string)
            const amountStr = String(amount);
            const amountDecimal =
            amountStr.includes(".")
                ? new Prisma.Decimal(amountStr)
                : new Prisma.Decimal((parseInt(amountStr) / 100).toFixed(2)); // convert cents → dollars if integer

            // 🧾 Prepare data to match your Prisma model
            const result = await prisma.$transaction(async (tx) => {
                const upsertData = {
                consult_id,                
                payment_intent_id,
                amount_cents: amountDecimal,
                preauth_date: preauth_date ? new Date(preauth_date) : new Date(),
                captured_date: captured_date ? new Date(captured_date) : null,
                refunded_date: refunded_date ? new Date(refunded_date) : null,
                refund_reason: refund_reason ?? null,
                created_by: created_by ?? userId,
                created_date: new Date(),
                updated_date: new Date(),
                };

                const payment = await tx.payment.upsert({
                    where: { consult_id },
                    create: upsertData,
                    update: upsertData,
                });
                
                const consult = await new ConsultService().update(
                    consult_id,
                    created_by ?? userId,
                    ConsultStatus.SUBMITTED
                );

            return { payment, consult };
            }); 
            if(result.consult){
                  const recipient = await prisma.provider.findUnique({
                    where: {
                      user_id: result.consult.provider_id
                    },
                    select: { 
                      display_name: true,
                      user:{
                        select: {
                          email: true
                        }
                      }
                    }
                  });
                  if(recipient?.user.email){
                    const linkToken = authService.generateConsultLinkToken(result.consult.patient_id, result.consult.id);
                      await notificationService.send({
                        templateName: "CONSULT_SUBMITTED",
                        recipient: recipient.user.email,
                        //recipient: "kindomekohune93@gmail.com",
                        variables: {
                          //name: recipient.display_name,
                          consultLink: `${process.env.VITE_BASE_URL}/verify/account/?redirect=/review/${result.consult.id}&linkToken=${linkToken}`
                        },
                        userId: result.consult.patient_id
                      });
                  }
                  
                } 
        return result;          

    }

    async capturePayment(payment_intent_id: string): Promise<string> {
        const intent = await stripe.paymentIntents.capture(payment_intent_id);
        console.log('Captured payment', intent.id, intent.status); // should be 'succeeded'        

        return intent.status;
    }

    async releaseAuthorizedPayment(payment_intent_id: string): Promise<string> {      
        
        // Retrieve the PaymentIntent to make sure it's in the right state
        const intent = await stripe.paymentIntents.retrieve(payment_intent_id);

        if (intent.status !== 'requires_capture') {
            console.log(`Cannot release payment. Current status: ${intent.status}`);
            throw new Error(`Cannot release payment. Current status: ${intent.status}`);            
        }

        // Cancel the authorization
        const canceled = await stripe.paymentIntents.cancel(payment_intent_id, {
            cancellation_reason: 'requested_by_customer',
        });
        
        
        return canceled.status;
    }


    
}

export default new PaymentService();