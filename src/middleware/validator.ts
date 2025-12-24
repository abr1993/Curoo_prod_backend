import { ConsultStatus, NameVisibilityOption, Pronoun, SexAtBirth } from "@prisma/client";
import { z } from "zod";

export const createConsultSchema = z.object({
  patientId: z.string().uuid(),
  providerId: z.string().uuid(),
  providerSpecialtyId: z.string().uuid(),

  questionBody: z.string().nullable().optional(),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  pronouns: z.enum(Pronoun).nullable().optional(),
  sexatbirth: z.enum(SexAtBirth).nullable().optional(),
  legalName: z.string().nullable().optional(),
  showNameOptions: z.enum(NameVisibilityOption).nullable().optional(),
  stateAtService: z.string().nullable().optional(),
  status: z.enum(ConsultStatus).nullable().optional(),
  createdBy: z.string().uuid().nullable().optional(),
  topics: z.array(z.string().nullable().optional()),
  historyFields: z
    .array(
      z.object({
        historyFieldId: z.string().uuid(),
        fieldName: z.string(),
        value: z.union([z.string(), z.array(z.string())]),
      })
    )
    .optional(),

  symptoms: z
    .array(
      z.object({
        specialtySymptomId: z.string().uuid(),
        value: z.number().int(),
      })
    )
    .optional(),
});

export const paymentSchema = z.object({
  consult_id: z.string().uuid("Invalid consult_id"),
  payment_intent_id: z.string().min(1, "payment_intent_id is required"),  
  amount: z.union([z.string(), z.number()]).refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    },
    { message: "amount must be a valid number greater than 0" }
  ),
  preauth_date: z.union([z.string(), z.date()]).optional().nullable(),
  captured_date: z.union([z.string(), z.date()]).optional().nullable(),
  refunded_date: z.union([z.string(), z.date()]).optional().nullable(),
  refund_reason: z.string().optional().nullable(),
  created_by: z.string().optional().nullable(),
});

// ✅ Export the inferred TS type
export type PaymentRequestBody = z.infer<typeof paymentSchema>;

// Type for TypeScript
export type CreateConsultInput = z.infer<typeof createConsultSchema>;




// export const updateConsultSchema = z.object({
//   body: z.object({
//     status: z
//       .enum(ConsultStatus)
//       .optional(),    
//   }),
// });
