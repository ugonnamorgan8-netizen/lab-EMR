import { z } from "zod";

export const roles = [
  "RECEPTIONIST",
  "ACCOUNTS",
  "LAB_SCIENTIST",
  "SUPERVISOR",
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
  laboratoryNumber: z.string().trim().min(1, "Laboratory number is required"),
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

export const adminUserCreateSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Valid email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[0-9]/, "Password must include a number")
    .regex(/[^A-Za-z0-9]/, "Password must include a symbol"),
  role: roleSchema,
  status: userStatusSchema.default("ACTIVE"),
  department: z.string().trim().optional().or(z.literal("")),
});
export type AdminUserCreateInput = z.infer<typeof adminUserCreateSchema>;

export const adminUserDeleteSchema = z.object({
  preserveData: z.boolean().default(true),
});
export type AdminUserDeleteInput = z.infer<typeof adminUserDeleteSchema>;

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

export const adminCatalogParameterSchema = z.object({
  name: z.string().trim().min(1, "Analyte name is required"),
  unit: z.string().trim().min(1, "Unit is required"),
  sortOrder: z.number().int().nonnegative().default(0),
});
export type AdminCatalogParameterInput = z.infer<typeof adminCatalogParameterSchema>;

export const adminCatalogReferenceRangeSchema = z.object({
  gender: z.string().trim().optional(),
  ageMinYears: z.number().int().nonnegative().optional(),
  ageMaxYears: z.number().int().nonnegative().optional(),
  normalLow: z.number().optional(),
  normalHigh: z.number().optional(),
  criticalLow: z.number().optional(),
  criticalHigh: z.number().optional(),
  unit: z.string().trim().min(1, "Reference range unit is required"),
});
export type AdminCatalogReferenceRangeInput = z.infer<typeof adminCatalogReferenceRangeSchema>;

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

export const resultValueInputSchema = z.object({
  parameterId: z.string().min(1),
  value: z.string().trim().min(1, "Value is required"),
  numericValue: z.number().optional(),
  flag: z
    .enum(["NORMAL", "LOW", "HIGH", "CRITICAL_LOW", "CRITICAL_HIGH", "ABNORMAL", "POSITIVE", "NEGATIVE", "INDETERMINATE", "SEE_NOTE"])
    .default("NORMAL"),
  flagNote: z.string().optional(),
});
export type ResultValueInput = z.infer<typeof resultValueInputSchema>;

export const enterResultSchema = z.object({
  values: z.array(resultValueInputSchema).min(1, "Enter at least one result value"),
  interpretation: z.string().trim().optional(),
  method: z.string().trim().optional(),
  instrument: z.string().trim().optional(),
  technicianNote: z.string().trim().optional(),
});
export type EnterResultInput = z.infer<typeof enterResultSchema>;

export const editResultSchema = z.object({
  values: z.array(resultValueInputSchema).min(1, "Enter at least one result value"),
  interpretation: z.string().trim().optional(),
  method: z.string().trim().optional(),
  instrument: z.string().trim().optional(),
  technicianNote: z.string().trim().optional(),
  amendmentNote: z.string().trim().min(1, "Reason for amendment is required"),
});
export type EditResultInput = z.infer<typeof editResultSchema>;

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

export const specimenTypeSchema = z.enum([
  "WHOLE_BLOOD", "SERUM", "PLASMA", "URINE", "STOOL", 
  "SPUTUM", "SWAB", "CSF", "TISSUE", "ASPIRATE", "SCRAPING", "OTHER"
]);
export type SpecimenType = z.infer<typeof specimenTypeSchema>;

export const testCategorySchema = z.enum([
  "HAEMATOLOGY", "BIOCHEMISTRY", "MICROBIOLOGY", "SEROLOGY_IMMUNOLOGY", 
  "HISTOPATHOLOGY", "CYTOLOGY", "PARASITOLOGY", "URINALYSIS", "COAGULATION", 
  "HORMONES", "TUMOUR_MARKERS", "DRUGS_TOXICOLOGY", "OTHER"
]);
export type TestCategory = z.infer<typeof testCategorySchema>;

export const deliveryMethodSchema = z.enum(["PRINT", "EMAIL", "SMS", "PORTAL", "WHATSAPP"]);
export type DeliveryMethod = z.infer<typeof deliveryMethodSchema>;

export const reportStatusSchema = z.enum(["PENDING", "GENERATED", "DISPATCHED", "AMENDED"]);
export type ReportStatus = z.infer<typeof reportStatusSchema>;

export const invoiceStatusSchema = z.enum(["UNPAID", "PARTIAL", "PAID", "VOID", "CORPORATE"]);
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;

export const resultStatusSchema = z.enum([
  "PENDING", "ENTERED", "DELTA_CHECK_FAILED", "QC_FAILED", 
  "VALIDATED", "AMENDED", "CANCELLED"
]);
export type ResultStatus = z.infer<typeof resultStatusSchema>;

export const resultFlagSchema = z.enum([
  "NORMAL", "LOW", "HIGH", "CRITICAL_LOW", "CRITICAL_HIGH", 
  "ABNORMAL", "POSITIVE", "NEGATIVE", "INDETERMINATE", "SEE_NOTE"
]);
export type ResultFlag = z.infer<typeof resultFlagSchema>;

export const qcRuleSchema = z.enum([
  "IN_CONTROL", "WARNING_1_2S", "REJECT_1_3S", "REJECT_2_2S", 
  "REJECT_R_4S", "REJECT_4_1S", "REJECT_10X"
]);
export type QCRule = z.infer<typeof qcRuleSchema>;

export const referralStatusSchema = z.enum([
  "PENDING", "SENT", "IN_TRANSIT", "RECEIVED_BACK", "RESULTED", "REJECTED"
]);
export type ReferralStatus = z.infer<typeof referralStatusSchema>;

export const notificationTypeSchema = z.enum([
  "CRITICAL_RESULT", "QC_FAILURE", "TAT_BREACH", "SAMPLE_REJECTED", 
  "REFERRAL_RECEIVED", "RESULT_READY", "LOW_QC_STOCK", "PAYMENT_RECEIVED"
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;
