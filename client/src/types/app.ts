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
  icon?: string;
  colorKey?: "sky" | "teal" | "violet" | "amber" | "emerald" | "green" | "rose" | "orange" | "indigo" | "slate" | "purple";
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

export type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  status: string;
  lastLogin: string | null;
  createdAt: string;
};

export type AdminUsersResponse = {
  totals: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
  };
  byRole: Record<string, number>;
  users: AdminUserRecord[];
};

export type DeletedUserArchive = {
  exportedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string | null;
    status: string;
    lastLogin: string | null;
    createdAt: string;
  };
  summary: {
    collectedSamples: number;
    validatedResults: number;
    dispatchedReports: number;
    qcEntries: number;
    auditLogs: number;
  };
  recentActivity: {
    collectedSamples: Array<{
      id: string;
      specimenId: string;
      collectedAt: string | null;
    }>;
    validatedResults: Array<{
      id: string;
      testOrderId: string;
      validatedAt: string | null;
    }>;
    dispatchedReports: Array<{
      id: string;
      reportId: string;
      dispatchedAt: string | null;
    }>;
    qcEntries: Array<{
      id: string;
      value: number;
      rule: string;
      runDate: string;
    }>;
    auditLogs: Array<{
      id: string;
      action: string;
      resourceType: string;
      resourceId: string;
      createdAt: string;
    }>;
  };
};

export type DeleteAdminUserResponse = {
  deletedUserId: string;
  preserved: boolean;
  archive: DeletedUserArchive | null;
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
    parameters: Array<{
      id: string;
      name: string;
      unit: string;
      sortOrder: number;
      referenceRanges: Array<{
        id: string;
        gender?: string | null;
        ageMinYears?: number | null;
        ageMaxYears?: number | null;
        normalLow?: number | null;
        normalHigh?: number | null;
        criticalLow?: number | null;
        criticalHigh?: number | null;
        unit: string;
      }>;
    }>;
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

export type WorkflowSample = {
  id: string;
  specimenId: string;
  specimenType: string;
  container: string;
  status: string;
  collectedAt?: string | null;
  condition?: string;
  visit: VisitSummary;
  testOrders: Array<{
    id: string;
    orderId: string;
    status: string;
    urgency: string;
    tatDeadline?: string | null;
    testCatalog: {
      id: string;
      code: string;
      name: string;
      department: string;
      price: number;
    };
  }>;
};

export type ProcessingOrder = {
  id: string;
  orderId: string;
  status: string;
  urgency: string;
  tatDeadline?: string | null;
  orderedAt: string;
  sample: {
    id: string;
    specimenId: string;
    status: string;
    visit: {
      id: string;
      visitId: string;
      urgency: string;
      status: string;
      registeredAt: string;
      patient: PatientSummary;
    };
  };
  testCatalog: {
    id: string;
    code: string;
    name: string;
    department: string;
    parameters: Array<{
      id: string;
      name: string;
      unit: string;
      referenceRanges: Array<{
        id: string;
        normalLow?: number | null;
        normalHigh?: number | null;
        criticalLow?: number | null;
        criticalHigh?: number | null;
      }>;
    }>;
  };
  result?: {
    id: string;
    status: string;
    enteredAt?: string | null;
    interpretation?: string | null;
    method?: string | null;
    instrument?: string | null;
    technicianNote?: string | null;
    values: Array<{
      id: string;
      value: string;
      numericValue?: number | null;
      flag: string;
      flagNote?: string | null;
      parameter: {
        id: string;
        name: string;
        unit: string;
      };
    }>;
  } | null;
};

export type ValidationItem = {
  id: string;
  status: string;
  enteredAt?: string | null;
  validatedAt?: string | null;
  values: Array<{
    id: string;
    value: string;
    numericValue?: number | null;
    flag: string;
    parameter: {
      id: string;
      name: string;
      unit: string;
    };
  }>;
  testOrder: {
    id: string;
    orderId: string;
    urgency: string;
    status: string;
    testCatalog: {
      id: string;
      code: string;
      name: string;
      department: string;
    };
    sample: {
      id: string;
      specimenId: string;
      visit: {
        id: string;
        visitId: string;
        urgency: string;
        status: string;
        patient: PatientSummary;
      };
    };
  };
};

export type QcDashboardResponse = {
  summary: {
    activeMaterials: number;
    warningRuns: number;
    rejectedRuns: number;
    expiringSoon: number;
  };
  materials: Array<{
    id: string;
    name: string;
    level: string;
    lotNumber: string;
    expiryDate: string;
    targetMean: number;
    targetSD: number;
    active: boolean;
    testCatalog: {
      id: string;
      code: string;
      name: string;
      department: string;
    };
    entries: Array<{
      id: string;
      value: number;
      zScore: number;
      rule: string;
      note?: string | null;
      runDate: string;
      enteredBy: string;
    }>;
  }>;
};

export type DispatchVisit = VisitSummary & {
  report?: {
    id: string;
    reportId: string;
    generatedAt?: string | null;
    dispatchedAt?: string | null;
    status: string;
    pdfUrl?: string | null;
    deliveryMethod?: string[];
  } | null;
};

export type BillingDashboardResponse = {
  summary: {
    totalInvoices: number;
    grossRevenue: number;
    collectedRevenue: number;
    outstandingBalance: number;
    unpaidCount: number;
    partialCount: number;
  };
  invoices: Array<{
    id: string;
    invoiceId: string;
    visitId: string;
    patientName: string;
    visitRef: string;
    totalAmount: number;
    patientBalance: number;
    status: string;
    paymentCount: number;
    createdAt: string;
    paidAt?: string | null;
  }>;
};

export type OutstandingInvoice = {
  id: string;
  invoiceId: string;
  visitId: string;
  patientName: string;
  patientPhone: string;
  visitRef: string;
  totalAmount: number;
  patientBalance: number;
  status: string;
  paymentCount: number;
  createdAt: string;
};

export type ResultReportResponse = {
  lab: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    director: string;
    accreditation: string;
    tagline: string;
    logoUrl: string;
  };
  visit: {
    id: string;
    visitId: string;
    status: string;
    urgency: string;
    registeredAt: string;
    type: string;
    patient: {
      id: string;
      patientId: string;
      firstName: string;
      lastName: string;
      gender: string;
      phone: string;
      email?: string | null;
      dateOfBirth: string;
      referringDoctor?: string | null;
      referringFacility?: string | null;
      clinicalHistory?: string | null;
    };
    invoice?: {
      invoiceId: string;
      status: string;
      totalAmount: number;
      patientBalance: number;
    } | null;
    report?: {
      reportId: string;
      status: string;
      generatedAt?: string | null;
      dispatchedAt?: string | null;
      amendmentNote?: string | null;
      amendedAt?: string | null;
    } | null;
  };
  tests: Array<{
    id: string;
    orderId: string;
    status: string;
    department: string;
    test: {
      code: string;
      name: string;
    };
    interpretation?: string | null;
    method?: string | null;
    instrument?: string | null;
    technicianNote?: string | null;
    validatedAt?: string | null;
    values: Array<{
      id: string;
      parameterName: string;
      value: string;
      numericValue?: number | null;
      unit: string;
      flag: string;
      flagNote?: string | null;
      referenceRange?: string | null;
    }>;
  }>;
  summary: {
    sampleCount: number;
    testCount: number;
    resultedCount: number;
    validatedCount: number;
  };
};
