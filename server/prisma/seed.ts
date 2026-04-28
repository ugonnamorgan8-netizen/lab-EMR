import bcrypt from "bcryptjs";
import dayjs from "dayjs";
import { PrismaClient, Role, SampleStatus, Urgency, VisitStatus } from "@prisma/client";
import { pathToFileURL } from "node:url";

export const prisma = new PrismaClient();

const users = [
  ["Reception User", "reception@labemr.test", Role.RECEPTIONIST, "Reception"],
  ["Accounts User", "accounts@labemr.test", Role.ACCOUNTS, "Accounts"],
  ["Scientist User", "scientist@labemr.test", Role.LAB_SCIENTIST, "Laboratory"],
  ["Supervisor User", "supervisor@labemr.test", Role.SUPERVISOR, "Management"],
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
  allergies: index % 4 === 0 ? ["Penicillin"] : [],
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
      ["Haemoglobin", "g/dL", 13, 17, 7, 20],
      ["WBC", "x10^9/L", 4, 11, 2, 25],
      ["Platelets", "x10^9/L", 150, 450, 50, 1000],
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
      ["ALT", "U/L", 0, 45, 0, 250],
      ["AST", "U/L", 0, 40, 0, 250],
      ["Albumin", "g/L", 35, 50, 20, 60],
    ],
  },
  {
    code: "GLU",
    name: "Glucose",
    category: "BIOCHEMISTRY",
    department: "Biochemistry",
    specimenTypes: ["PLASMA"],
    container: "Fluoride",
    sampleVolume: 2,
    price: 3500,
    tatHoursRoutine: 12,
    tatHoursUrgent: 3,
    tatHoursStat: 1,
    parameters: [["Glucose", "mmol/L", 3.9, 6.1, 2.5, 20]],
  },
  {
    code: "UA",
    name: "Urinalysis",
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
      ["Protein", "", 0, 0, 0, 0],
      ["Glucose", "", 0, 0, 0, 0],
      ["Pus Cells", "/hpf", 0, 5, 0, 100],
    ],
  },
  {
    code: "HIV",
    name: "HIV Screen",
    category: "SEROLOGY_IMMUNOLOGY",
    department: "Serology",
    specimenTypes: ["SERUM"],
    container: "SST",
    sampleVolume: 3,
    price: 4500,
    tatHoursRoutine: 12,
    tatHoursUrgent: 4,
    tatHoursStat: 2,
    parameters: [["HIV Result", "", 0, 0, 0, 0]],
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
      { key: "lab.name", value: "ST. DAVID MEDICAL DIAGNOSTIC CENTRE" },
      { key: "lab.address", value: "BERLIN PLAZA #NO 110 OGUI ROAD ENUGU STATE NIGERIA" },
      { key: "lab.phone", value: "08100094967" },
      { key: "lab.email", value: "info@stdavidmedicaldiagnostic.org.ng" },
      { key: "lab.website", value: "www.stdavidmedicaldiagnostic.org.ng" },
      { key: "lab.director", value: "Dr. Ifeoma Balogun, FMCPath" },
      { key: "lab.accreditation", value: "MLSCN-ACC-2026-014" },
      { key: "lab.tagline", value: "Excellence in Diagnostic Services" },
      { key: "lab.logoUrl", value: "/lab-logo.jpeg" },
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
        specimenTypes: catalog.specimenTypes as never,
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

  const qcOfficer = createdUsers.find((user) => user.role === Role.LAB_SCIENTIST)!;
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

  const receptionist = createdUsers.find((user) => user.role === Role.RECEPTIONIST)!;
  const scientist = createdUsers.find((user) => user.role === Role.LAB_SCIENTIST)!;
  const accountant = createdUsers.find((user) => user.role === Role.ACCOUNTS)!;
  const supervisor = createdUsers.find((user) => user.role === Role.SUPERVISOR)!;

  for (let i = 0; i < 15; i += 1) {
    const patient = createdPatients[i];
    const visit = await prisma.visit.create({
      data: {
        visitId: `VIS-20260426-${String(i + 1).padStart(4, "0")}`,
        patientId: patient.id,
        type: i % 4 === 0 ? "REFERRAL" : "WALK_IN",
        urgency: i % 5 === 0 ? Urgency.STAT : i % 3 === 0 ? Urgency.URGENT : Urgency.ROUTINE,
        referringDoctor: patient.referringDoctor,
        referringFacility: patient.referringFacility,
        clinicalHistory: patient.clinicalHistory,
        status:
          i < 4
            ? VisitStatus.REGISTERED
            : i < 7
              ? VisitStatus.SAMPLE_COLLECTED
              : i < 10
                ? VisitStatus.IN_PROCESSING
                : i < 12
                  ? VisitStatus.VALIDATED
                  : VisitStatus.DISPATCHED,
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
            visit.status === VisitStatus.REGISTERED
              ? SampleStatus.PENDING_COLLECTION
              : visit.status === VisitStatus.SAMPLE_COLLECTED
                ? SampleStatus.COLLECTED
                : SampleStatus.IN_ANALYSIS,
          collectedAt: visit.status === VisitStatus.REGISTERED ? null : dayjs().subtract(6, "hour").toDate(),
          collectedById: visit.status === VisitStatus.REGISTERED ? null : scientist.id,
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
              visit.status === VisitStatus.REGISTERED
                ? "PENDING"
                : visit.status === VisitStatus.SAMPLE_COLLECTED
                  ? "PENDING"
                  : visit.status === VisitStatus.IN_PROCESSING
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

        if (visit.status === VisitStatus.VALIDATED || visit.status === VisitStatus.DISPATCHED) {
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

    if (visit.status === VisitStatus.VALIDATED || visit.status === VisitStatus.DISPATCHED) {
      await prisma.report.create({
        data: {
          reportId: `RPT-20260426-${String(i + 1).padStart(4, "0")}`,
          visitId: visit.id,
          generatedAt: dayjs().subtract(1, "hour").toDate(),
          dispatchedAt: visit.status === VisitStatus.DISPATCHED ? dayjs().toDate() : null,
          dispatchedById: visit.status === VisitStatus.DISPATCHED ? supervisor.id : null,
          deliveryMethod: visit.status === VisitStatus.DISPATCHED ? ["PRINT", "EMAIL"] : [],
          status: visit.status === VisitStatus.DISPATCHED ? "DISPATCHED" : "GENERATED",
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
        metadata: { visitId: visit.visitId, status: visit.status },
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
