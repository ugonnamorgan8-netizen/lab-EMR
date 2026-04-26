import { prisma } from "../lib/prisma.js";
import { buildDailyIdentifier } from "../utils/ids.js";
import type { PatientRegistrationInput } from "../../../shared/types/index.js";

export async function searchPatients(query: string) {
  return prisma.patient.findMany({
    where: {
      OR: [
        { patientId: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } },
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      visits: {
        orderBy: { registeredAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function createPatient(input: PatientRegistrationInput) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const count = await prisma.patient.count({
    where: {
      createdAt: { gte: todayStart },
    },
  });

  return prisma.patient.create({
    data: {
      ...input,
      email: input.email || null,
      patientId: buildDailyIdentifier("PAT", count),
      dateOfBirth: new Date(input.dateOfBirth),
    },
  });
}

export async function getPatientById(id: string) {
  return prisma.patient.findUnique({
    where: { id },
    include: {
      visits: {
        orderBy: { registeredAt: "desc" },
        include: {
          samples: {
            include: {
              testOrders: {
                include: { testCatalog: true, result: true },
              },
            },
          },
        },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
