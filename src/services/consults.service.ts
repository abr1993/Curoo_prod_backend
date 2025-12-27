// src/services/consult.service.ts
import { date, email } from 'zod';
import prisma from '../prisma.js';
import { ConsultStatus, NameVisibilityOption, Prisma, ReportStatus, SexAtBirth, UserRole } from '@prisma/client';
import type { CreateConsultInput } from '../middleware/validator.js';
import paymentService from './payment.service.js';
import { notificationService } from './notification.service.js';
import { error } from 'console';
import authService from './auth.service.js';

type MedicalHistoryEntry = {
  field_name: string;
  value: string | string[]; // Text fields or multi-select arrays
};

/* type HistoryFieldInput = {
  historyFieldId: string;
  fieldName: string;
  value: string | string[];
};

type SymptomInput = {
  specialtySymptomId: string;
  value: number;
};

type TopicInput = {
  specialtyConditionId: string;  
}; */

/* interface CreateConsultInput {
  patientId: string;
  providerId: string;
  providerSpecialtyId: string;
  questionBody: string;
  dateOfBirth: string;
  pronoun?: Pronoun;
  sexAtBirth?: SexAtBirth;
  legalName?: string;
  showNameOptions?: NameVisibilityOption;
  stateAtService?: string;
  status?: ConsultStatus;
  createdBy?: string;
  historyFields?: HistoryFieldInput[];
  symptoms?: SymptomInput[];
  topics: string[];
} */

export class ConsultService {
  async list(userId: string, role: string) {
    
    const consults = await prisma.consult.findMany({
      where: {
        deleted_date: null,
        ...(role === "PATIENT"
          ? { patient_id: userId }
          : { provider_id: userId }),
          ...(role === "PROVIDER" ? { status: { not: "ISDRAFT" } } : {}),
      },
      include: {
        patient: { select: { id: true, email: true } },
        provider: { select: { id: true, email: true } },
        
        
        payment: true,
        consult_specialty_conditions:{
          include:{
            specialty_condition:{
              select:{
                id: true,
                condition:{
                  select:{
                    name: true,
                    description: true
                  }
                }
              }
            }
          }
        },
        consult_specialty_symptoms: {
        where: { deleted_date: null},
        select: {
          Value: true,
          specialty_symptom: {
            select: {
              id: true,
              symptom: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      medical_history: {
        select: {
          data: true,          
          
        },
      },
      },
      orderBy: { created_date: "desc" },
    });

    const flattenedConsults = consults.map(consult => ({
      ...consult,
      topics: consult.consult_specialty_conditions.map(c => ({
        id: c.id,
        name: c.specialty_condition.condition.name,
        description: c.specialty_condition.condition.description
      }))

    }));
    
    return flattenedConsults;
  }

  async getById(consultId: string) {  
    
      const consult = await prisma.consult.findUnique({
      where: { id: consultId, deleted_date: null },
      include: {
        // Include related medical history fields
        medical_history: true, 

        // Include related specialty symptoms
        consult_specialty_symptoms: {
        select: {
          Value: true,
          specialty_symptom: {
            select: {
              id: true,
              symptom: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }, 

        // Optionally include patient and provider info
        patient: true,
        provider: true,
        provider_specialty: true,
      },
    });

    if (!consult) {
      throw new Error(`Consult with id ${consultId} not found`);
    }

    return consult;
  }

  async getConsultById(consultId: string, role: UserRole, linkToken?:string) {
    const consult = await prisma.consult.findUnique({
      where: { id: consultId, deleted_date: null },
      omit: { },
      include: {
        medical_history: true, // contains a `data` JSON field
        consult_specialty_symptoms: {
          where: { deleted_date: null},
          include: {
            specialty_symptom: {
              include:{
                symptom: true
              }
            }, // related to specialty_symptom via symptom_id
          },
        },
        consult_specialty_conditions:{
          include:{
            specialty_condition: {
              select:{
                id: true,
                condition:{
                  select:{
                    name: true,
                    description: true
                  }
                }
              }
            }
          }
        },
        patient: {
          select: { id: true, email: true, },
        },
        provider: {
          select:{ id: true, email: true }
        },
        provider_specialty:{
          select:{
            provider: true
          }
        }
        
      },
    });

    if (!consult) {
      throw new Error(`Consult with id ${consultId} not found`);
    }

    let legalName = consult.legal_name;
    if (role === UserRole.PROVIDER) {
      if (!legalName) legalName = NameVisibilityOption.ANONYMOUS;

      switch (consult.show_name_options) {
        case NameVisibilityOption.INITIALS_ONLY:
          legalName = this.getInitials(legalName);
          break;
        case NameVisibilityOption.ANONYMOUS:
          legalName = NameVisibilityOption.ANONYMOUS;
          break;
        default:
          // keep legalName as is
          break;
      }
    }
    // Transform medical history from JSON field
    const medical_history = consult.medical_history
      ? Object.entries(consult.medical_history.data as Record<string, any>).map(
          ([fieldName, value]) => ({
            fieldName: value.field_name,
            value: value.value,
          })
        )
      : [];



    // Transform specialty symptoms
    const consult_specialty_symptoms = consult.consult_specialty_symptoms.map((symptom) => ({
         
          Value: symptom.Value,
          specialty_symptom: {            
              id: symptom.specialty_symptom_id,
              symptom: {                
                  id: symptom.id,
                  name: symptom.specialty_symptom.symptom.name,                
              },        
        
      },
    }));
    const consult_specialty_conditions = consult.consult_specialty_conditions.map((condition) => ({
         id: condition.specialty_condition.id,
        name: condition.specialty_condition.condition.name,
        description: condition.specialty_condition.condition.description
          
    }));


    return {
      id: consult.id,
      patient: consult.patient, // only email 
      provider: consult.provider, // only email 
      provider_name: consult.provider_specialty?.provider.display_name,
      topics: consult_specialty_conditions,
      question_body: consult.question_body,
      date_of_birth: consult.date_of_birth,
      pronoun: consult.pronoun,
      sex_at_birth: consult.sex_at_birth,
      legal_name: legalName,
      show_name_options: consult.show_name_options,
      state_at_service: consult.state_at_service,
      status: consult.status,
      created_by: consult.created_by,
      submitted_date: consult.submitted_date,
      accepted_date: consult.accepted_date,
      answered_date: consult.answered_date,
      declined_date: consult.declined_date,
      timed_out_date: consult.timed_out_date,
      medical_history,
      consult_specialty_symptoms,
    };
    
  }

  async getProviderByConsultId(consultId: string){
      const provider = await prisma.consult.findFirst({
        where: {
          id: consultId
        },
        select:{
          provider_specialty:{
            select:{
              provider:true
            }
          }
        }
      });

      return provider?.provider_specialty?.provider.display_name;

  }

   getInitials(fullName: string): string {
      if (!fullName) {
        return "";
      }

      // 1. Trim leading/trailing whitespace
      const trimmedName = fullName.trim();

      // 2. Split the name by any whitespace (single or multiple spaces)
      // and filter out any empty strings resulting from multiple spaces
      const nameParts = trimmedName.split(/\s+/).filter(part => part.length > 0);

      // 3. Map each name part to its first letter (initial)
      const initials = nameParts
        .map(part => part[0]) // Get the first character
        .join('')             // Join the characters together
        .toUpperCase();       // Convert to uppercase for standard initials

      return initials;
    }

  async createConsult(input: CreateConsultInput) {
  const {
    patientId,
    providerId,
    providerSpecialtyId,
    questionBody,
    dateOfBirth,
    pronouns,
    sexatbirth,
    legalName,
    showNameOptions,
    stateAtService,
    status,
    historyFields,
    symptoms,
    topics,
    createdBy,
  } = input;

  console.log("patientId", patientId);
console.log("providerId", input.providerId);
console.log("topics", topics);


  return await prisma.$transaction(async (tx) => {
    // 1️⃣ Create the main Consult record
    const consult = await prisma.consult.create({
    data: {
      patient: { connect: { id: patientId } },
      provider: { connect: { id: providerId } },
      provider_specialty: { connect: { id: providerSpecialtyId } },
      state_at_service: stateAtService ?? null,
      question_body: questionBody ?? null,
      date_of_birth: dateOfBirth ?? new Date(),
      pronoun: pronouns ?? null,
      sex_at_birth: sexatbirth ?? null,
      legal_name: legalName ?? null,
      show_name_options: showNameOptions ?? NameVisibilityOption.ANONYMOUS,
      status: status ?? ConsultStatus.ISDRAFT,      
      created_by: createdBy ?? patientId,
      consult_specialty_conditions: {
        create: topics.map((topicId) => ({
          specialty_condition: { connect: { id: topicId } as Prisma.SpecialtyConditionWhereUniqueInput},
          created_by: patientId
        })),
      }      
    },
  });

    // 2️⃣ Get SpecialtyForHistory linked to the providerSpecialty
    const providerSpecialty = await tx.providerSpecialty.findUnique({
      where: { id: providerSpecialtyId },
      include: {
        specialty: {
          include: { history_template: true },
        },
      },
    });

    if (!providerSpecialty?.specialty?.history_template) {
      throw new Error('No history template found for this provider specialty');
    }

    /* (topics ?? []).forEach((topic) => {

    }) */

    // 3️⃣ Save ConsultMedicalHistory (JSON data)
    const medicalHistoryJson: Record<string, MedicalHistoryEntry> = {};
    (historyFields ?? []).forEach((field) => {
      medicalHistoryJson[field.historyFieldId] = {
        field_name: field.fieldName,
        value: field.value,
      };
    });
      
    await tx.consultMedicalHistory.create({
      data: {
        consult_id: consult.id,
        specialty_id: providerSpecialty.specialty.history_template.id,
        data: medicalHistoryJson, // Stored as JSON
      },
    });

    // 4️⃣ Save ConsultSpecialtySymptom entries
    if (symptoms && symptoms.length > 0) {
      await tx.consultSpecialtySymptom.createMany({
        data: symptoms.map((sym) => ({
          consult_id: consult.id,
          specialty_symptom_id: sym.specialtySymptomId,
          Value: sym.value,
          created_by: patientId ?? null,
        })),
      });
    }    

    return consult;
  });
}

async updateConsult(input: CreateConsultInput, id: string) {
  const {
    patientId,
    providerId,
    providerSpecialtyId,
    questionBody,
    dateOfBirth,
    pronouns,
    sexatbirth,
    legalName,
    showNameOptions,
    stateAtService,
    status,
    historyFields,
    symptoms,
    topics,
    createdBy,
  } = input;

  console.log("Updating consultId", id);
  console.log("topics", topics);
  console.log("pronoun", pronouns);
  console.log("sexatbirth", sexatbirth);

  return await prisma.$transaction(async (tx) => {
    // 1️⃣ Update the main Consult record
    const data: any = {};
      if (patientId) data.patient = { connect: { id: patientId } };
      if (providerId) data.provider = { connect: { id: providerId } };
      if (providerSpecialtyId) data.provider_specialty = { connect: { id: providerSpecialtyId } };
      if (stateAtService !== undefined) data.state_at_service = stateAtService; // string | null
      if (questionBody !== undefined) data.question_body = questionBody;
      if (dateOfBirth !== undefined) data.date_of_birth = dateOfBirth;
      if (pronouns !== undefined) data.pronoun = pronouns;
      if (sexatbirth !== undefined) data.sex_at_birth = sexatbirth;
      if (legalName !== undefined) data.legal_name = legalName;
      if (showNameOptions !== undefined) data.show_name_options = showNameOptions;
      if (status !== undefined) data.status = status;
      if (createdBy !== undefined) data.created_by = createdBy;
      data.submitted_date = new Date();
      data.updated_date = new Date();
    const consult = await tx.consult.update({
                  where: { id },
                  data
                });


    const now = new Date();

    
    if (topics && topics.length > 0) {
        const validTopics = topics.filter((topicId): topicId is string => !!topicId);

        for (const topicId of validTopics) {
          const existing = await tx.consultSpecialtyCondition.findFirst({
            where: { consult_id: consult.id, specialty_condition_id: topicId },
          });

          if (existing) {
            await tx.consultSpecialtyCondition.update({
              where: { id: existing.id },
              data: { 
                specialty_condition_id: topicId,               
                updated_by: patientId,
                updated_date: new Date(),
              },
            });
          } else {
            await tx.consultSpecialtyCondition.create({
              data: {
                consult_id: consult.id,
                specialty_condition_id: topicId,
                created_by: patientId,
              },
            });
          }
        }
      }    

      const providerSpecialty = await tx.providerSpecialty.findUnique({
        where: { id: providerSpecialtyId },
        include: {
          specialty: {
            include: { history_template: true },
          },
        },
      });

      if (!providerSpecialty?.specialty?.history_template) {
        throw new Error('No history template found for this provider specialty');
      }
    // 3️⃣ Soft delete old medical history if new historyFields provided
    /* if (historyFields && historyFields.length > 0) {
      const medicalHistoryJson: Record<string, MedicalHistoryEntry> = {};
      historyFields.forEach((field) => {
        medicalHistoryJson[field.historyFieldId] = {
          field_name: field.fieldName,
          value: field.value,
        };
      });

      await tx.consultMedicalHistory.updateMany({
        where: { consult_id: consult.id },
        data: { data: medicalHistoryJson, deleted_date: null },
      });
    } */
    if (historyFields && historyFields.length > 0) {
      // Build JSON data
      const medicalHistoryJson: Record<string, MedicalHistoryEntry> = {};
      historyFields.forEach((field) => {
        medicalHistoryJson[field.historyFieldId] = {
          field_name: field.fieldName,
          value: field.value,
        };
      });

      // Check if an entry already exists for this consult
      const existingHistory = await tx.consultMedicalHistory.findUnique({
        where: { consult_id: consult.id },
      });

      if (existingHistory) {
        const existingData = (existingHistory.data as Record<string, MedicalHistoryEntry> | null) || {};
        // Merge new data into existing JSON
        const updatedData = {
          ...existingData,
          ...medicalHistoryJson, // overwrite matching keys, keep others
        };

        await tx.consultMedicalHistory.update({
          where: { consult_id: consult.id },
          data: {
            data: updatedData,
            deleted_date: null,
          },
        });
      } else {
        // Create a new record
        await tx.consultMedicalHistory.create({
          data: {
            consult_id: consult.id,
            specialty_id: providerSpecialty.specialty.history_template.id, // adjust depending on your context
            data: medicalHistoryJson,
          },
        });
      }
    }




    // 4️⃣ Soft delete old symptoms if new symptoms provided
      /* if (symptoms && symptoms.length > 0) {
  // 1️⃣ Soft-delete old active symptoms
          await prisma.consultSpecialtySymptom.updateMany({
            where: { consult_id: id, deleted_date: null },
            data: { deleted_date: new Date() },
          });
          const newactivesymptoms = await prisma.consultSpecialtySymptom.findMany({
            where:{
              consult_id: id
            }
          })
          console.log(newactivesymptoms);
          // 2️⃣ Insert new symptoms
          const validSymptoms = symptoms.filter((s) => s.specialtySymptomId && s.value !== undefined);

          if (validSymptoms.length > 0) {
            await prisma.consultSpecialtySymptom.createMany({
              data: validSymptoms.map((s) => ({
                consult_id: id,
                specialty_symptom_id: s.specialtySymptomId!,
                Value: s.value!,
                created_by: patientId,
              })),
            });
          }
        } */
       if (symptoms && symptoms.length > 0) {
          const existingSymptoms = await prisma.consultSpecialtySymptom.findMany({
            where: { consult_id: id },
          });

          for (const s of symptoms) {
            if (!s.specialtySymptomId || s.value === undefined) continue;

            const existing = existingSymptoms.find(
              (sym) => sym.specialty_symptom_id === s.specialtySymptomId
            );

            if (existing) {
              // Update existing record
              await prisma.consultSpecialtySymptom.update({
                where: { id: existing.id },
                data: {
                  Value: s.value!,
                  deleted_date: null,
                  updated_date: new Date(),
                },
              });
            } else {
              // Create new record
              await prisma.consultSpecialtySymptom.create({
                data: {
                  consult_id: id,
                  specialty_symptom_id: s.specialtySymptomId!,
                  Value: s.value!,
                  created_by: patientId,
                },
              });
            }
          }
        }




    return consult;
  });
}

  async update(id: string, userId: string, status: ConsultStatus) {
    return prisma.consult.update({
      where: { id },
      data: {
        status,
        updated_date: new Date(),
        updated_by: userId, // from your token payload
      },
    });
  }

  async accept(id: string) {
    const hours = Number(process.env.CONSULT_EXPIRE_HOURS ?? 12);
    const payment = await prisma.payment.findUnique({
      where: {consult_id: id},
      select:{
        payment_intent_id: true
      }
    });
   
    if (!payment || !payment.payment_intent_id) {
      throw new Error("No payment found for this consult");
    }

    const status = await paymentService.capturePayment(payment.payment_intent_id);
      if(status === "succeeded"){
        const [updatedConsult, updatedPayment] = await prisma.$transaction([
          prisma.consult.update({
            where: { id },
            data: {
              status: ConsultStatus.ACCEPTED,
              accepted_date: new Date(),
            },
          }),
          prisma.payment.update({
            where: { consult_id: id },
            data: {
              captured_date: new Date(),
              updated_date: new Date(),
            },
          }),
          
        ]);
        const provider = await prisma.user.findUnique({
          where: {
            id: updatedConsult.provider_id
          },
          select: {             
            email: true
            }          
        });
        if(provider?.email){
          await notificationService.send({
            templateName: "ACCEPTED_CONSULT",
            recipient: provider.email,
            variables: {
              //name: notif.patientName,
              //doctorLastName: notif.displayName,
              expiryTime: `${hours} hours`
            },
          });

        }
         
        const patient = await prisma.user.findUnique({
          where: {
            id: updatedConsult.patient_id
          },
          select: {             
            email: true
            }          
        });
        if(patient?.email){
          await notificationService.send({
            templateName: "CONSULT_ACCEPTED",
            recipient: patient.email,
            variables: {
              //name: notif.patientName,
              //doctorLastName: notif.displayName,
              
            },
          });
        }
        
        
      return {
        consult: updatedConsult,
        payment_intent_id: payment.payment_intent_id,
        status,
        //payment: updatedPayment
      };
    }
    return {
      consult: null,
      payment_intent_id: payment.payment_intent_id,
      status,
      
    };
    
  }

  async answer(
    id: string,
    userId: string,
    reportData: {
      overview: string;
      differentials_general: string;
      self_care_general: string;
      when_to_seek_care: string;      
      signed_by?: string;
      signed_date?: Date;      
    },
    is_draft = true,
  ) {

    return await prisma.$transaction(async (tx) => {
      
      // Create report entry
      const report = await tx.report.upsert({
          where: { consult_id: id }, 
          update: {
            overview: reportData.overview,
            differentials_general: reportData.differentials_general,
            self_care_general: reportData.self_care_general,
            when_to_seek_care: reportData.when_to_seek_care,
            report_status: is_draft ? ReportStatus.ISDRAFT : ReportStatus.COMPLETED,
            signed_by: userId,
            signed_date: new Date(),
            updated_by: userId,
            updated_date: new Date(),
          },
          create: {
            consult_id: id,
            overview: reportData.overview,
            differentials_general: reportData.differentials_general,
            self_care_general: reportData.self_care_general,
            when_to_seek_care: reportData.when_to_seek_care,
            report_status: is_draft ? ReportStatus.ISDRAFT : ReportStatus.COMPLETED,
            signed_by: userId,
            signed_date: new Date(),
            created_by: userId,
          },
        });


      if (!is_draft){
        // Update consult status
        const updatedConsult = await tx.consult.update({
          where: { id },
          data: {
            status: ConsultStatus.ANSWERED,
            answered_date: new Date(),
            updated_by: userId,
          },
        });
        const recipient = await tx.user.findUnique({
          where: {
            id: updatedConsult.patient_id
          },
          select: {             
            email: true
            }
          
        });
        if(recipient?.email){
          const linkToken = authService.generateConsultLinkToken(updatedConsult.patient_id, updatedConsult.id);
            await notificationService.send({
              templateName: "CONSULT_ANSWERED",
              recipient: recipient.email,
              //recipient: "kindomekohune93@gmail.com",
              variables: {
                //name: updatedConsult.legal_name || "",
                consultLink: `${process.env.VITE_BASE_URL}/verify/account/?redirect=/status/${updatedConsult.id}&linkToken=${linkToken}`
              },
              userId: updatedConsult.provider_id
            });
        }
        return { updatedConsult, report };
      }

      return report;
  });
    
  }

  async decline(id: string, userId: string, auto_decline = false) {
    
    const payment = await prisma.payment.findUnique({
        where: {consult_id: id},
        select:{
          payment_intent_id: true
        }
      });
    
      if (!payment || !payment.payment_intent_id) {
        throw new Error("No payment found for this consult");
      }

    const paymentIntentStatus = await paymentService.releaseAuthorizedPayment(payment.payment_intent_id);
    
    //console.log(`SRRIPE INTENT STATUS: ${paymentIntentStatus}`);
        if(paymentIntentStatus === "canceled"){
          const [updatedConsult, updatedPayment,] = await prisma.$transaction([
                prisma.consult.update({
                  where: { id },
                  data: {
                    status: auto_decline
                      ? ConsultStatus.TIMEDOUT
                      : ConsultStatus.DECLINED,
                    declined_date: auto_decline ? null : new Date(),
                    timed_out_date: auto_decline ? new Date() : null,
                  },
                }),
                prisma.payment.update({
                  where: { consult_id: id },
                  data: {
                      refunded_date: new Date(),
                      refund_reason: 'Payment authorization released by provider',
                      updated_by: userId,
                      updated_date: new Date(),
                  },
                }),
                
              ]);
              
              const patient = await prisma.user.findUnique({
                where: { id: updatedConsult.patient_id},
                select: {
                  email: true
                }
              });
              const provider = await prisma.provider.findUnique({
                where:{ user_id: updatedConsult.provider_id},
                select: {
                  display_name: true,
                  user:{
                    select:{
                      email: true
                    }
                  }
                }
              });
              if(auto_decline){
                return {
                  consult: updatedConsult,
                  payment_intent_id: payment.payment_intent_id,
                  paymentIntentStatus,
                  payment: updatedPayment,
                  patient:patient,
                  provider:provider
                };
              }
              console.log("Notification error: ", patient?.email, provider?.display_name);              
                if(patient?.email && provider?.display_name){
                    await notificationService.send({
                      templateName: "CONSULT_DECLINED",
                      recipient: patient?.email,
                      variables: {
                        //name: updatedConsult.legal_name ?? patient.email,
                        //doctorLastName: provider.display_name,
                        
                      },
                    });
                }        
              
            return {
              consult: updatedConsult,
              payment_intent_id: payment.payment_intent_id,
              paymentIntentStatus,
              payment: updatedPayment
            };            
        }        

        return {
          consult: null,
          payment_intent_id: payment.payment_intent_id,
          paymentIntentStatus: "Failed",          
        };
    
  }

  async delete(id: string, userId: string) {
    return prisma.consult.update({
      where: { id },
      data: {        
        deleted_date: new Date(),
        updated_date: new Date(),
        updated_by: userId               
      },
    });
  }

  async createReport(data: any) {
    const {
      patient_id,
      provider_id,
      topics,
      eye_histories,
      systemics,
      ...rest
    } = data;

    return prisma.report.create({
      data: {
        ...rest,
        patient_id,
        provider_id,
       
      },
    
    });
  }

  async getReport(consult_id: string) {
    const report = await prisma.report.findUnique({
      where: { consult_id, deleted_date: null },
      include: {
        consult: {
          select: {
            id: true,
            provider_id: true,
            patient_id: true,
            created_date: true,
            
          },
        },
      },
    });

    if (!report) {
      throw new Error("Report not found for this consult_id");
    }

    return report;
  }
}



export default new ConsultService();
