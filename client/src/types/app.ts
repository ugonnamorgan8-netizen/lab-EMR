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

export type AdminAnalytics = {
  generatedAt: string;
  metrics: {
    totalPatients: number;
    visitsToday: number;
    activeVisits: number;
    pendingSamples: number;
    testsInAnalysis: number;
    reportsGenerated: number;
    tatBreaches: number;
    revenueCollected: number;
    outstandingBalance: number;
  };
  visitStatusBreakdown: Array<{
    status: string;
    count: number;
  }>;
  urgencyBreakdown: Array<{
    urgency: string;
    count: number;
  }>;
  departmentVolumes: Array<{
    department: string;
    count: number;
  }>;
  recentVisits: Array<{
    id: string;
    visitId: string;
    patientName: string;
    urgency: string;
    status: string;
    registeredAt: string;
    testCount: number;
  }>;
};

export type AdminUsersResponse = {
  totals: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
  };
  byRole: Record<string, number>;
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    department: string | null;
    status: string;
    lastLogin: string | null;
    createdAt: string;
  }>;
};

export type AdminSettingsResponse = {
  settings: Array<{
    key: string;
    value: string;
    updatedAt: string;
  }>;
  footprint: {
    userCount: number;
    patientCount: number;
    catalogCount: number;
    panelCount: number;
    auditCount: number;
  };
};

export type AdminCatalogResponse = {
  summary: {
    totalTests: number;
    activeTests: number;
    totalPanels: number;
    activePanels: number;
  };
  categories: Record<string, number>;
  tests: Array<{
    id: string;
    code: string;
    name: string;
    category: string;
    department: string;
    specimenTypes: string[];
    container: string;
    price: number;
    active: boolean;
    sampleVolume: number;
    parameterCount: number;
    referenceRangeCount: number;
  }>;
  panels: Array<{
    id: string;
    code: string;
    name: string;
    description: string | null;
    price: number;
    active: boolean;
    testCount: number;
    tests: Array<{
      id: string;
      code: string;
      name: string;
    }>;
  }>;
};

export type AuditLogItem = {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string | null;
  metadata: unknown;
  createdAt: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
};
