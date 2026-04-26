import type {
  AuthUser,
  PatientRegistrationInput,
  Role,
  Urgency,
  VisitStatus,
} from "@shared/index";

export type { AuthUser, PatientRegistrationInput, Role, Urgency, VisitStatus };

export type NavItem = {
  label: string;
  to: string;
  badge?: string | number;
};

export type PatientSummary = {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  dateOfBirth: string;
  allergies: string[];
  referringDoctor?: string | null;
  clinicalHistory?: string | null;
};

export type VisitSummary = {
  id: string;
  visitId: string;
  urgency: Urgency;
  status: VisitStatus;
  registeredAt: string;
  patient: PatientSummary;
  samples: Array<{
    id: string;
    specimenId: string;
    specimenType: string;
    container: string;
    status: string;
    testOrders: Array<{
      id: string;
      orderId: string;
      urgency: Urgency;
      tatDeadline?: string | null;
      testCatalog: {
        id: string;
        code: string;
        name: string;
        price: number;
        department: string;
      };
    }>;
  }>;
  invoice?: {
    id: string;
    totalAmount: number;
    patientBalance: number;
    status: string;
  } | null;
};

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  resourceLink?: string | null;
  read: boolean;
  createdAt: string;
};
