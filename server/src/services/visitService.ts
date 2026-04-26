import { Prisma, type VisitStatus } from "@prisma/client";
import type { CreateVisitInput } from "../../../shared/types/index.js";
import { prisma } from "../lib/prisma.js";
import { getIo } from "../socket/socket.js";
import { buildDailyIdentifier } from "../utils/ids.js";
import { groupTestsBySample } from "../utils/sampleGrouping.js";
import { calculateTatDeadline } from "../utils/tat.js";

export async function createVisitAndInvoice(input: CreateVisitInput) {
  const visitCount = await prisma.visit.count();
  const sampleCount = await prisma.sample.count();
  const orderCount = await prisma.testOrder.count();
  const invoiceCount = await prisma.invoice.count();

  const patient = await prisma.patient.findUniqueOrThrow({ where: { id: input.patientId } });
  const tests = await prisma.testCatalog.findMany({
    where: {
      id: { in: input.tests.map((test) => test.testCatalogId) },
      active: true,
    },
    include: {
      parameters: {
        include: { referenceRanges: true },
      },
    },
  });

  const visit = await prisma.$transaction(async (tx) => {
    const createdVisit = await tx.visit.create({
      data: {
        visitId: buildDailyIdentifier("VIS", visitCount),
        patientId: input.patientId,
        type: input.type,
        urgency: input.urgency,
        referralLetter: input.referralLetter,
        referringDoctor: input.referringDoctor ?? patient.referringDoctor,
        referringFacility: input.referringFacility ?? patient.referringFacility,
        clinicalHistory: input.clinicalHistory ?? patient.clinicalHistory,
      },
    });

    const groupedSamples = groupTestsBySample(tests);
    const orderLookup = new Map(input.tests.map((test) => [test.testCatalogId, test.urgency] as const));
    const createdOrders: {
      id: string;
      description: string;
      price: number;
    }[] = [];

    let orderSequence = 0;

    for (const [sampleIndex, group] of groupedSamples.entries()) {
      const sample = await tx.sample.create({
        data: {
          specimenId: buildDailyIdentifier("SPE", sampleCount + sampleIndex),
          visitId: createdVisit.id,
          specimenType: group.specimenType,
          container: group.container,
          volume: group.volume,
        },
      });

      for (const test of group.tests) {
        const urgency = orderLookup.get(test.id) ?? input.urgency;
        const order = await tx.testOrder.create({
          data: {
            orderId: buildDailyIdentifier("ORD", orderCount + orderSequence),
            sampleId: sample.id,
            testCatalogId: test.id,
            urgency,
            tatDeadline: calculateTatDeadline(test, urgency),
          },
        });
        orderSequence += 1;

        createdOrders.push({
          id: order.id,
          description: test.name,
          price: test.price,
        });
      }
    }

    const subtotal = createdOrders.reduce((sum, item) => sum + item.price, 0);

    await tx.invoice.create({
      data: {
        invoiceId: buildDailyIdentifier("INV", invoiceCount),
        patientId: input.patientId,
        visitId: createdVisit.id,
        subtotal,
        totalAmount: subtotal,
        patientBalance: subtotal,
        lineItems: {
          create: createdOrders.map((order) => ({
            description: order.description,
            unitPrice: order.price,
            total: order.price,
            testOrderId: order.id,
          })),
        },
      },
    });

    return tx.visit.findUniqueOrThrow({
      where: { id: createdVisit.id },
      include: {
        patient: true,
        invoice: {
          include: { lineItems: true },
        },
        samples: {
          include: {
            testOrders: {
              include: { testCatalog: true },
            },
          },
        },
      },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  getIo().emit("queue:update", {
    visitId: visit.visitId,
    status: visit.status,
    urgency: visit.urgency,
  });

  return visit;
}

export async function listVisits(filters: { date?: string; status?: string; urgency?: string }) {
  const where: Prisma.VisitWhereInput = {};

  if (filters.status) {
    where.status = filters.status as never;
  }

  if (filters.urgency) {
    where.urgency = filters.urgency as never;
  }

  if (filters.date) {
    const day = new Date(filters.date);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    where.registeredAt = { gte: day, lt: nextDay };
  }

  return prisma.visit.findMany({
    where,
    orderBy: [{ urgency: "desc" }, { registeredAt: "desc" }],
    include: {
      patient: true,
      samples: {
        include: { testOrders: true },
      },
      invoice: true,
      report: true,
    },
  });
}

export async function updateVisitStatus(id: string, status: VisitStatus) {
  const visit = await prisma.visit.update({
    where: { id },
    data: { status },
  });

  getIo().emit("queue:update", {
    visitId: visit.visitId,
    status: visit.status,
    urgency: visit.urgency,
  });

  return visit;
}
