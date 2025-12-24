import { PrismaClient } from '@prisma/client';
import { notificationService } from '../services/notification.service.js';
import consultsService from './consults.service.js';

const prisma = new PrismaClient();
type AutoDeclineResult = {
  notificationPayloads: {
    patientEmail: string;    
    providerEmail: string;   
    
    consultId: string;
    status: string;
  }[];
};


class ExpireConsultsService{
   extractSixDigits (input: string): string {
  // Extract all digits from the string
    const digits = input.replace(/\D/g, '');

    // Take only the first 6 digits
    const firstSix = digits.slice(0, 6);

    // If fewer than 6 digits, pad with zeros at the end
    return firstSix.padEnd(6, '0');
  }

  async expireOldConsults() {
    try {
      const hours = Number(process.env.CONSULT_EXPIRE_HOURS ?? 12);
      const submittedHoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
      
    // const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

      // 1️⃣ RUN DATABASE OPERATIONS INSIDE A TRANSACTION
      const results = await prisma.$transaction(async (tx):Promise<AutoDeclineResult> => {
        
        // Get stale consults
        const staleConsults = await tx.consult.findMany({
          where: {
            status: 'SUBMITTED',
            submitted_date: { lte: submittedHoursAgo },
          },
        });
        

        if (staleConsults.length === 0) {
          return  {notificationPayloads: []} // no notifications to send
        }
        
        const notificationPayloads: {
          patientEmail: string;          
          providerEmail: string;        
          consultId: string;
          status: string;
        }[] = [];


        for (const consult of staleConsults) {
          
          // Update consult status
          const result = await consultsService.decline(consult.id, "SYSTEM", true);          
          
          if(result.paymentIntentStatus === "canceled"){
              if (result.provider?.user?.email && result.patient?.email) {
                notificationPayloads.push({
                  patientEmail: result.patient.email,              
                  providerEmail: result.provider.user.email,        
                 
                  consultId: consult.id,
                  status: "TIMED_OUT"
                });
              }
          }else{
            notificationPayloads.push({
                  patientEmail: "",              
                  providerEmail: "",              
                  
                  consultId: consult.id,
                  status: "FAILED_TO_TIME_OUT"
              });

          }
          
        }
        return {notificationPayloads} ;
      }); // END TRANSACTION

      // 2️⃣ SEND NOTIFICATIONS OUTSIDE THE TRANSACTION
      for (const notif of results.notificationPayloads) {
        if(notif.status === "TIMED_OUT"){
             // Notify patient
            await notificationService.send({
              templateName: "CONSULT_REQUEST_EXPIRED",
              recipient: notif.patientEmail,
              variables: {
                //name: notif.patientName,
                //doctorLastName: notif.displayName,
                expiryTime: `${hours} hours`
              },
            });

            // Notify provider
            await notificationService.send({
              templateName: "CONSULT_EXPIRED",
              recipient: notif.providerEmail,
              variables: {
                //name: notif.providerName,
                consultId: this.extractSixDigits(notif.consultId),
                expiryTime: `${hours} hours`
              },
            });

           // console.log(`Sent auto-decline notifications for consult ${notif.consultId}`);

        }       

        
      }
      const consultStatuses = results.notificationPayloads.map((payload) => ({
        consultId: payload.consultId,
        status: payload.status, 
      }));

      return {declinedConsults: consultStatuses}
    } catch (err) {
      console.error("Error auto-declining consults:", err);
    } finally {
      await prisma.$disconnect();
    }
  }

}
 

export default new ExpireConsultsService();