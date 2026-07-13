import { prisma } from "../lib/prisma.js";
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
  const { laboratoryNumber, ...rest } = input;

  return prisma.patient.create({
    data: {
      ...rest,
      email: rest.email || null,
      patientId: laboratoryNumber.trim(),
      dateOfBirth: new Date(rest.dateOfBirth),
    },
  });
}

export async function listPatients() {
  return prisma.patient.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
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
