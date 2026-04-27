import { z } from "zod";

export const roles = [
  "RECEPTIONIST",
  "PHLEBOTOMIST",
  "LAB_SCIENTIST",
  "LAB_TECHNICIAN",
  "QC_OFFICER",
  "DISPATCH_OFFICER",
  "ACCOUNTANT",
  "LAB_MANAGER",
  "ADMIN",
] as const;

export const roleSchema = z.enum(roles);
export type Role = z.infer<typeof roleSchema>;

export const userStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export const userStatusSchema = z.enum(userStatuses);
export type UserStatus = z.infer<typeof userStatusSchema>;

export const urgencySchema = z.enum(["ROUTINE", "URGENT", "STAT"]);
export type Urgency = z.infer<typeof urgencySchema>;

export const orderStatusSchema = z.enum([
  "PENDING",
  "IN_ANALYSIS",
  "RESULTED",
  "VALIDATED",
  "REPORTED",
  "REFERRED_OUT",
  "CANCELLED",
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const visitStatusSchema = z.enum([
  "REGISTERED",
  "SAMPLE_COLLECTED",
  "IN_PROCESSING",
  "AWAITING_QC",
  "VALIDATED",
  "DISPATCHED",
  "CANCELLED",
]);
export type VisitStatus = z.infer<typeof visitStatusSchema>;

export const patientRegistrationSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  phone: z.string().trim().min(1, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  insuranceProvider: z.string().optional(),
  policyNumber: z.string().optional(),
  nationality: z.string().optional(),
  referringDoctor: z.string().optional(),
  referringFacility: z.string().optional(),
  clinicalHistory: z.string().optional(),
  allergies: z.array(z.string()).default([]),
});
export type PatientRegistrationInput = z.infer<typeof patientRegistrationSchema>;
export type PatientRegistrationFormInput = z.input<typeof patientRegistrationSchema>;

export const visitTypeSchema = z.enum([
  "WALK_IN",
  "REFERRAL",
  "CORPORATE",
  "HOME_COLLECTION",
]);
export type VisitType = z.infer<typeof visitTypeSchema>;

export const createVisitSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  type: visitTypeSchema.default("WALK_IN"),
  urgency: urgencySchema.default("ROUTINE"),
  referralLetter: z.string().optional(),
  referringDoctor: z.string().optional(),
  referringFacility: z.string().optional(),
  clinicalHistory: z.string().optional(),
  tests: z
    .array(
      z.object({
        testCatalogId: z.string().min(1),
        urgency: urgencySchema.default("ROUTINE"),
      }),
    )
    .min(1, "Select at least one test"),
});
export type CreateVisitInput = z.infer<typeof createVisitSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const adminUserUpdateSchema = z
  .object({
    role: roleSchema.optional(),
    status: userStatusSchema.optional(),
    department: z.string().trim().min(1, "Department cannot be empty").optional().or(z.literal("")),
  })
  .refine((value) => value.role !== undefined || value.status !== undefined || value.department !== undefined, {
    message: "Provide at least one field to update",
  });
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;

export const systemSettingUpdateSchema = z.object({
  value: z.string(),
});
export type SystemSettingUpdateInput = z.infer<typeof systemSettingUpdateSchema>;

export const adminCatalogTestUpdateSchema = z
  .object({
    department: z.string().trim().min(1, "Department is required").optional(),
    price: z.number().nonnegative("Price must be zero or greater").optional(),
    active: z.boolean().optional(),
  })
  .refine((value) => value.department !== undefined || value.price !== undefined || value.active !== undefined, {
    message: "Provide at least one field to update",
  });
export type AdminCatalogTestUpdateInput = z.infer<typeof adminCatalogTestUpdateSchema>;

export const paymentMethodSchema = z.enum([
  "CASH",
  "CARD",
  "BANK_TRANSFER",
  "HMO",
  "POS",
]);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const recordPaymentSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  method: paymentMethodSchema,
  reference: z.string().optional(),
});
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

export const sampleConditionSchema = z.enum([
  "ACCEPTABLE",
  "HAEMOLYSED",
  "LIPAEMIC",
  "ICTERIC",
  "CLOTTED",
  "INSUFFICIENT",
  "WRONG_CONTAINER",
  "UNLABELLED",
  "REJECTED",
]);
export type SampleCondition = z.infer<typeof sampleConditionSchema>;

export const sampleStatusSchema = z.enum([
  "PENDING_COLLECTION",
  "COLLECTED",
  "IN_TRANSIT",
  "RECEIVED_LAB",
  "IN_CENTRIFUGE",
  "ALIQUOTED",
  "IN_ANALYSIS",
  "ANALYSIS_COMPLETE",
  "STORED",
  "DISPOSED",
]);
export type SampleStatus = z.infer<typeof sampleStatusSchema>;

export const collectSampleSchema = z.object({
  collectedAt: z.string(),
  condition: sampleConditionSchema,
  conditionNote: z.string().optional(),
});
export type CollectSampleInput = z.infer<typeof collectSampleSchema>;

export const sampleWorkflowUpdateSchema = z.object({
  status: z.enum(["RECEIVED_LAB", "IN_CENTRIFUGE", "ALIQUOTED", "IN_ANALYSIS", "STORED", "DISPOSED"]),
});
export type SampleWorkflowUpdateInput = z.infer<typeof sampleWorkflowUpdateSchema>;

export const processingResultEntrySchema = z.object({
  method: z.string().trim().optional(),
  instrument: z.string().trim().optional(),
  technicianNote: z.string().trim().optional(),
});
export type ProcessingResultEntryInput = z.infer<typeof processingResultEntrySchema>;

export const qcEntryCreateSchema = z.object({
  value: z.number(),
  note: z.string().trim().optional(),
});
export type QcEntryCreateInput = z.infer<typeof qcEntryCreateSchema>;

export const dispatchReportSchema = z.object({
  deliveryMethod: z.enum(["PRINT", "EMAIL", "SMS", "PORTAL", "WHATSAPP"]).default("PRINT"),
});
export type DispatchReportInput = z.infer<typeof dispatchReportSchema>;

export const apiErrorSchema = z.object({
  message: z.string(),
  details: z.record(z.string(), z.array(z.string())).optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string | null;
};
