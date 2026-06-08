import bcrypt from "bcryptjs";
import dayjs from "dayjs";
import { PrismaClient } from "@prisma/client";
// Enum string literals (inlined to avoid runtime import issues)
import { pathToFileURL } from "node:url";

export const prisma = new PrismaClient();

const users = [
  ["Reception User", "reception@labemr.test", "RECEPTIONIST", "Reception"],
  ["Accounts User", "accounts@labemr.test", "ACCOUNTS", "Accounts"],
  ["Scientist User", "scientist@labemr.test", "LAB_SCIENTIST", "Laboratory"],
  ["Supervisor User", "supervisor@labemr.test", "SUPERVISOR", "Management"],
] as const;

const patients = Array.from({ length: 20 }).map((_, index) => ({
  patientId: `PAT-20260426-${String(index + 1).padStart(4, "0")}`,
  firstName: ["Ada", "Chinedu", "Bola", "Fatima", "James"][index % 5],
  lastName: ["Okafor", "Adeyemi", "Danjuma", "Ibrahim", "Eze"][index % 5],
  dateOfBirth: dayjs("1985-01-01").add(index, "year").toDate(),
  gender: index % 3 === 0 ? "Female" : index % 3 === 1 ? "Male" : "Other",
  phone: `0803000${String(index).padStart(4, "0")}`,
  email: `patient${index + 1}@example.com`,
  address: `${index + 12} Sample Street, Lagos`,
  emergencyContact: `Contact ${index + 1}`,
  emergencyPhone: `0804000${String(index).padStart(4, "0")}`,
  insuranceProvider: index % 2 === 0 ? "AXA Mansard" : "Hygeia",
  policyNumber: `POL-${index + 1}`,
  nationality: "Nigerian",
  referringDoctor: index % 2 === 0 ? "Dr. Bello" : "Dr. Uche",
  referringFacility: index % 2 === 0 ? "Prime Clinic" : "Wellness Centre",
  clinicalHistory: "Routine laboratory assessment",
  allergies: JSON.stringify(index % 4 === 0 ? ["Penicillin"] : []),
}));

const catalogSeed = [
  {
    code: "FBC",
    name: "Full Blood Count",
    category: "HAEMATOLOGY",
    department: "Haematology",
    specimenTypes: ["WHOLE_BLOOD"],
    container: "EDTA",
    sampleVolume: 3,
    price: 8000,
    tatHoursRoutine: 24,
    tatHoursUrgent: 6,
    tatHoursStat: 2,
    parameters: [
      // ── Red Cell Indices ────────────────────────────────────────────────────
      ["Haemoglobin (HGB)", "g/dL", 13.0, 17.0, 7.0, 20.0],
      ["RBC Count", "x10^12/L", 4.5, 5.5, 2.0, 7.0],
      ["Haematocrit (HCT/PCV)", "%", 40, 52, 20, 65],
      ["MCV", "fL", 80, 100, 60, 120],
      ["MCH", "pg", 27, 33, 15, 45],
      ["MCHC", "g/dL", 32, 36, 20, 42],
      ["RDW-CV", "%", 11.5, 14.5, 9.0, 25.0],
      ["RDW-SD", "fL", 35, 56, 20, 80],
      // ── White Cell Total & Differential ────────────────────────────────────
      ["WBC Count", "x10^9/L", 4.0, 11.0, 2.0, 25.0],
      ["Neutrophils (Abs)", "x10^9/L", 1.8, 7.5, 0.5, 20.0],
      ["Neutrophils (%)", "%", 40, 75, 10, 95],
      ["Lymphocytes (Abs)", "x10^9/L", 1.0, 4.0, 0.5, 10.0],
      ["Lymphocytes (%)", "%", 20, 45, 5, 70],
      ["Monocytes (Abs)", "x10^9/L", 0.2, 1.0, 0.0, 3.0],
      ["Monocytes (%)", "%", 2, 10, 0, 20],
      ["Eosinophils (Abs)", "x10^9/L", 0.02, 0.5, 0.0, 2.0],
      ["Eosinophils (%)", "%", 1, 6, 0, 15],
      ["Basophils (Abs)", "x10^9/L", 0.0, 0.1, 0.0, 1.0],
      ["Basophils (%)", "%", 0, 1, 0, 5],
      // ── Platelet Indices ────────────────────────────────────────────────────
      ["Platelets (PLT)", "x10^9/L", 150, 450, 50, 1000],
      ["MPV", "fL", 7.4, 10.4, 5.0, 15.0],
      ["PDW", "%", 10, 18, 6, 25],
    ],
  },
  {
    code: "LFT",
    name: "Liver Function Test",
    category: "BIOCHEMISTRY",
    department: "Biochemistry",
    specimenTypes: ["SERUM"],
    container: "SST",
    sampleVolume: 4,
    price: 15000,
    tatHoursRoutine: 24,
    tatHoursUrgent: 6,
    tatHoursStat: 2,
    parameters: [
      // ── Bilirubin ──────────────────────────────────────────────────────────
      ["Total Bilirubin", "µmol/L", 0, 21, 0, 200],
      ["Direct (Conjugated) Bilirubin", "µmol/L", 0, 5, 0, 100],
      ["Indirect Bilirubin", "µmol/L", 0, 16, 0, 150],
      // ── Liver Enzymes ─────────────────────────────────────────────────────
      ["ALT (Alanine Aminotransferase)", "U/L", 7, 45, 0, 500],
      ["AST (Aspartate Aminotransferase)", "U/L", 10, 40, 0, 500],
      ["ALP (Alkaline Phosphatase)", "U/L", 44, 147, 0, 1000],
      ["GGT (Gamma-Glutamyltransferase)", "U/L", 9, 48, 0, 500],
      // ── Proteins ──────────────────────────────────────────────────────────
      ["Total Protein", "g/L", 60, 80, 30, 100],
      ["Albumin", "g/L", 35, 50, 15, 60],
      ["Globulin", "g/L", 20, 35, 10, 60],
      ["A/G Ratio", "", 1.2, 2.2, 0.5, 4.0],
      // ── Coagulation (basic) ───────────────────────────────────────────────
      ["Prothrombin Time (PT)", "seconds", 11, 13.5, 8, 30],
    ],
  },
  {
    code: "GLU",
    name: "Blood Glucose & Diabetes Profile",
    category: "BIOCHEMISTRY",
    department: "Biochemistry",
    specimenTypes: ["PLASMA"],
    container: "Fluoride",
    sampleVolume: 3,
    price: 7500,
    tatHoursRoutine: 12,
    tatHoursUrgent: 3,
    tatHoursStat: 1,
    parameters: [
      ["Fasting Blood Glucose", "mmol/L", 3.9, 6.1, 2.2, 33.3],
      ["2-Hr Post-Prandial Glucose", "mmol/L", 0, 7.8, 0, 33.3],
      ["Random Blood Glucose", "mmol/L", 3.9, 7.8, 2.2, 33.3],
      ["HbA1c", "%", 0, 5.6, 0, 15],
      ["Serum Insulin (Fasting)", "µIU/mL", 2.6, 24.9, 0, 300],
    ],
  },
  {
    code: "UA",
    name: "Urinalysis (Dipstick + Microscopy)",
    category: "URINALYSIS",
    department: "Urinalysis",
    specimenTypes: ["URINE"],
    container: "Urine Cup",
    sampleVolume: 10,
    price: 5000,
    tatHoursRoutine: 24,
    tatHoursUrgent: 6,
    tatHoursStat: 2,
    parameters: [
      // ── Physical ──────────────────────────────────────────────────────────
      ["Colour", "", 0, 0, 0, 0],
      ["Appearance (Turbidity)", "", 0, 0, 0, 0],
      ["Specific Gravity", "", 1.005, 1.030, 1.001, 1.040],
      ["pH", "", 4.5, 8.0, 4.0, 9.0],
      // ── Dipstick Chemical ─────────────────────────────────────────────────
      ["Protein", "", 0, 0, 0, 0],
      ["Glucose", "", 0, 0, 0, 0],
      ["Ketones", "", 0, 0, 0, 0],
      ["Bilirubin", "", 0, 0, 0, 0],
      ["Urobilinogen", "µmol/L", 0, 17, 0, 200],
      ["Nitrites", "", 0, 0, 0, 0],
      ["Leucocyte Esterase", "", 0, 0, 0, 0],
      ["Blood (Haemoglobin)", "", 0, 0, 0, 0],
      // ── Microscopy ────────────────────────────────────────────────────────
      ["Pus Cells (WBC)", "/hpf", 0, 5, 0, 100],
      ["RBC (Erythrocytes)", "/hpf", 0, 2, 0, 50],
      ["Epithelial Cells", "/hpf", 0, 5, 0, 50],
      ["Casts", "/lpf", 0, 0, 0, 20],
      ["Bacteria", "", 0, 0, 0, 0],
      ["Crystals", "", 0, 0, 0, 0],
    ],
  },
  {
    code: "HIV",
    name: "HIV Screen & Confirmatory",
    category: "SEROLOGY_IMMUNOLOGY",
    department: "Serology",
    specimenTypes: ["SERUM"],
    container: "SST",
    sampleVolume: 5,
    price: 6000,
    tatHoursRoutine: 12,
    tatHoursUrgent: 4,
    tatHoursStat: 2,
    parameters: [
      ["HIV 1/2 Rapid Screen (Determine)", "", 0, 0, 0, 0],
      ["HIV 1/2 Rapid Confirmatory (Unigold)", "", 0, 0, 0, 0],
      ["HIV 1/2 Tie-Breaker (Stat-Pak)", "", 0, 0, 0, 0],
      ["Final HIV Result", "", 0, 0, 0, 0],
    ],
  },
] as const;

export async function seedDemoData() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.billingItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.report.deleteMany();
  await prisma.referralTest.deleteMany();
  await prisma.resultValue.deleteMany();
  await prisma.testResult.deleteMany();
  await prisma.qCEntry.deleteMany();
  await prisma.qCMaterial.deleteMany();
  await prisma.testOrder.deleteMany();
  await prisma.sample.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.referenceRange.deleteMany();
  await prisma.testParameter.deleteMany();
  await prisma.testPanelItem.deleteMany();
  await prisma.testPanel.deleteMany();
  await prisma.testCatalog.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSetting.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);
  const createdUsers = [];
  for (const [name, email, role, department] of users) {
    const user = await prisma.user.create({
      data: { name, email, role, department, passwordHash },
    });
    createdUsers.push(user);
  }

  await prisma.systemSetting.createMany({
    data: [
      { key: "lab.name", value: "PHENOM LABS" },
      { key: "lab.address", value: "Africa" },
      { key: "lab.phone", value: "" },
      { key: "lab.email", value: "hello@phenomlabs.com" },
      { key: "lab.website", value: "phenomlabs.com" },
      { key: "lab.director", value: "" },
      { key: "lab.accreditation", value: "" },
      { key: "lab.tagline", value: "We Build, Teach and Automate with AI." },
      { key: "lab.logoUrl", value: "/favicon.svg" },
    ],
  });

  const createdPatients = [];
  for (const patient of patients) {
    const createdPatient = await prisma.patient.create({ data: patient });
    createdPatients.push(createdPatient);
  }

  for (const catalog of catalogSeed) {
    await prisma.testCatalog.create({
      data: {
        code: catalog.code,
        name: catalog.name,
        category: catalog.category as never,
        department: catalog.department,
        specimenTypes: JSON.stringify(catalog.specimenTypes),
        container: catalog.container,
        sampleVolume: catalog.sampleVolume,
        price: catalog.price,
        tatHoursRoutine: catalog.tatHoursRoutine,
        tatHoursUrgent: catalog.tatHoursUrgent,
        tatHoursStat: catalog.tatHoursStat,
        parameters: {
          create: catalog.parameters.map(
            ([name, unit, low, high, criticalLow, criticalHigh]: readonly [string, string, number, number, number, number], sortOrder) => ({
            name,
            unit,
            sortOrder,
            referenceRanges: {
              create: [
                {
                  gender: null,
                  ageMinYears: 18,
                  ageMaxYears: 120,
                  normalLow: low,
                  normalHigh: high,
                  criticalLow,
                  criticalHigh,
                  unit,
                },
              ],
            },
            }),
          ),
        },
      },
    });
  }

  const fbc = await prisma.testCatalog.findUniqueOrThrow({ where: { code: "FBC" } });
  const lft = await prisma.testCatalog.findUniqueOrThrow({ where: { code: "LFT" } });
  const glu = await prisma.testCatalog.findUniqueOrThrow({ where: { code: "GLU" } });
  const ua = await prisma.testCatalog.findUniqueOrThrow({ where: { code: "UA" } });
  const hiv = await prisma.testCatalog.findUniqueOrThrow({ where: { code: "HIV" } });

  const panel = await prisma.testPanel.create({
    data: {
      code: "ANTENATAL",
      name: "Antenatal Screen",
      description: "Sample bundled antenatal panel",
      price: 22000,
      items: {
        create: [{ testCatalogId: hiv.id }, { testCatalogId: ua.id }],
      },
    },
  });

  const qcOfficer = createdUsers.find((user) => user.role === "LAB_SCIENTIST")!;
  for (const [index, testCatalogId] of [fbc.id, lft.id, glu.id].entries()) {
    const material = await prisma.qCMaterial.create({
      data: {
        name: `BioRad Control ${index + 1}`,
        level: `Level ${index + 1}`,
        lotNumber: `LOT-${index + 1}`,
        expiryDate: dayjs().add(120, "day").toDate(),
        testCatalogId,
        targetMean: 10 + index * 5,
        targetSD: 1.5,
      },
    });

    for (let i = 0; i < 30; i += 1) {
      const value = i === 7 ? 15 : i === 17 ? 5 : 10 + index * 5 + ((i % 4) - 1) * 0.6;
      const zScore = Number(((value - (10 + index * 5)) / 1.5).toFixed(2));
      await prisma.qCEntry.create({
        data: {
          qcMaterialId: material.id,
          value,
          zScore,
          rule: Math.abs(zScore) > 3 ? "REJECT_1_3S" : Math.abs(zScore) > 2 ? "WARNING_1_2S" : "IN_CONTROL",
          enteredById: qcOfficer.id,
          runDate: dayjs().subtract(30 - i, "day").toDate(),
        },
      });
    }
  }

  const receptionist = createdUsers.find((user) => user.role === "RECEPTIONIST")!;
  const scientist = createdUsers.find((user) => user.role === "LAB_SCIENTIST")!;
  const accountant = createdUsers.find((user) => user.role === "ACCOUNTS")!;
  const supervisor = createdUsers.find((user) => user.role === "SUPERVISOR")!;

  for (let i = 0; i < 15; i += 1) {
    const patient = createdPatients[i];
    const visit = await prisma.visit.create({
      data: {
        visitId: `VIS-20260426-${String(i + 1).padStart(4, "0")}`,
        patientId: patient.id,
        type: i % 4 === 0 ? "REFERRAL" : "WALK_IN",
        urgency: i % 5 === 0 ? "STAT" : i % 3 === 0 ? "URGENT" : "ROUTINE",
        referringDoctor: patient.referringDoctor,
        referringFacility: patient.referringFacility,
        clinicalHistory: patient.clinicalHistory,
        status:
          i < 4
            ? "REGISTERED"
            : i < 7
              ? "SAMPLE_COLLECTED"
              : i < 10
                ? "IN_PROCESSING"
                : i < 12
                  ? "VALIDATED"
                  : "DISPATCHED",
      },
    });

    const tests = [fbc, lft, glu, ua, hiv].slice(0, (i % 3) + 2);
    const grouped = new Map<string, typeof tests>();
    tests.forEach((test) => {
      const key = `${test.specimenTypes[0]}:${test.container}`;
      const existing = grouped.get(key) ?? [];
      existing.push(test);
      grouped.set(key, existing);
    });

    const invoiceItems: { description: string; unitPrice: number; total: number; testOrderId: string }[] = [];

    for (const [groupIndex, group] of Array.from(grouped.values()).entries()) {
      const sample = await prisma.sample.create({
        data: {
          specimenId: `SPE-20260426-${String(i + 1).padStart(2, "0")}${String(groupIndex + 1).padStart(2, "0")}`,
          visitId: visit.id,
          specimenType: group[0].specimenTypes[0],
          container: group[0].container,
          volume: group.reduce((sum, item) => sum + item.sampleVolume, 0),
          status:
            visit.status === "REGISTERED"
              ? "PENDING_COLLECTION"
              : visit.status === "SAMPLE_COLLECTED"
                ? "COLLECTED"
                : "IN_ANALYSIS",
          collectedAt: visit.status === "REGISTERED" ? null : dayjs().subtract(6, "hour").toDate(),
          collectedById: visit.status === "REGISTERED" ? null : scientist.id,
        },
      });

      for (const test of group) {
        const hours =
          visit.urgency === Urgency.STAT
            ? test.tatHoursStat
            : visit.urgency === Urgency.URGENT
              ? test.tatHoursUrgent
              : test.tatHoursRoutine;
        const order = await prisma.testOrder.create({
          data: {
            orderId: `ORD-20260426-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
            sampleId: sample.id,
            testCatalogId: test.id,
            testPanelId: i % 6 === 0 ? panel.id : null,
            urgency: visit.urgency,
            status:
              visit.status === "REGISTERED"
                ? "PENDING"
                : visit.status === "SAMPLE_COLLECTED"
                  ? "PENDING"
                  : visit.status === "IN_PROCESSING"
                    ? "IN_ANALYSIS"
                    : "VALIDATED",
            tatDeadline: dayjs(visit.registeredAt).add(hours, "hour").toDate(),
          },
        });

        invoiceItems.push({
          description: test.name,
          unitPrice: test.price,
          total: test.price,
          testOrderId: order.id,
        });

        if (visit.status === "VALIDATED" || visit.status === "DISPATCHED") {
          const params = await prisma.testParameter.findMany({ where: { testCatalogId: test.id } });
          await prisma.testResult.create({
            data: {
              testOrderId: order.id,
              status: "VALIDATED",
              enteredAt: dayjs().subtract(2, "hour").toDate(),
              enteredBy: receptionist.id,
              validatedAt: dayjs().subtract(1, "hour").toDate(),
              validatedById: scientist.id,
              deltaCheckPassed: true,
              values: {
                create: params.map((parameter, valueIndex) => ({
                  parameterId: parameter.id,
                  value: String(10 + valueIndex),
                  numericValue: 10 + valueIndex,
                  flag: "NORMAL",
                })),
              },
            },
          });
        }
      }
    }

    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const patientBalance = i % 4 === 0 ? 0 : i % 4 === 1 ? subtotal / 2 : subtotal;
    const status = patientBalance === 0 ? "PAID" : patientBalance === subtotal ? "UNPAID" : "PARTIAL";

    const invoice = await prisma.invoice.create({
      data: {
        invoiceId: `INV-20260426-${String(i + 1).padStart(4, "0")}`,
        patientId: patient.id,
        visitId: visit.id,
        subtotal,
        totalAmount: subtotal,
        patientBalance,
        status,
        lineItems: {
          create: invoiceItems,
        },
      },
    });

    if (status !== "UNPAID") {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: subtotal - patientBalance,
          method: i % 2 === 0 ? "CARD" : "CASH",
          reference: `PMT-${i + 1}`,
          recordedBy: accountant.id,
        },
      });
    }

    if (visit.status === "VALIDATED" || visit.status === "DISPATCHED") {
      await prisma.report.create({
        data: {
          reportId: `RPT-20260426-${String(i + 1).padStart(4, "0")}`,
          visitId: visit.id,
          generatedAt: dayjs().subtract(1, "hour").toDate(),
          dispatchedAt: visit.status === "DISPATCHED" ? dayjs().toDate() : null,
          dispatchedById: visit.status === "DISPATCHED" ? supervisor.id : null,
          deliveryMethod: JSON.stringify(visit.status === "DISPATCHED" ? ["PRINT", "EMAIL"] : []),
          status: visit.status === "DISPATCHED" ? "DISPATCHED" : "GENERATED",
          pdfUrl: `/reports/${visit.visitId}.pdf`,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: receptionist.id,
        action: "CREATE_VISIT",
        resourceType: "Visit",
        resourceId: visit.id,
        metadata: JSON.stringify({ visitId: visit.visitId, status: visit.status }),
      },
    });
  }

  console.log("Seed completed");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedDemoData()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
