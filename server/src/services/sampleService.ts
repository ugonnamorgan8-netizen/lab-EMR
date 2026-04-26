import { prisma } from "../lib/prisma.js";
import { getIo } from "../socket/socket.js";

export async function listSamples(filters: { visitId?: string; status?: string }) {
  return prisma.sample.findMany({
    where: {
      visitId: filters.visitId,
      status: filters.status as never,
    },
    orderBy: { createdAt: "desc" },
    include: {
      visit: {
        include: {
          patient: true,
        },
      },
      testOrders: {
        include: {
          testCatalog: true,
        },
      },
    },
  });
}

export async function getSampleBySpecimenId(specimenId: string) {
  return prisma.sample.findUnique({
    where: { specimenId },
    include: {
      visit: {
        include: {
          patient: true,
        },
      },
      testOrders: {
        include: {
          testCatalog: true,
        },
      },
    },
  });
}

export async function collectSample(sampleId: string, payload: { userId: string; collectedAt: string; condition: string; conditionNote?: string }) {
  const sample = await prisma.sample.update({
    where: { id: sampleId },
    data: {
      collectedAt: new Date(payload.collectedAt),
      collectedById: payload.userId,
      status: payload.condition === "REJECTED" ? "PENDING_COLLECTION" : "COLLECTED",
      condition: payload.condition as never,
      conditionNote: payload.conditionNote,
    },
    include: {
      visit: true,
    },
  });

  if (payload.condition === "REJECTED") {
    getIo().emit("sample:rejected", {
      specimenId: sample.specimenId,
      reason: payload.conditionNote ?? "Sample rejected",
      visitId: sample.visit.visitId,
    });
  } else {
    const remaining = await prisma.sample.count({
      where: {
        visitId: sample.visitId,
        status: { not: "COLLECTED" },
      },
    });

    if (remaining === 0) {
      await prisma.visit.update({
        where: { id: sample.visitId },
        data: { status: "SAMPLE_COLLECTED" },
      });
    }

    getIo().emit("sample:collected", {
      visitId: sample.visit.visitId,
      specimenId: sample.specimenId,
      collectedBy: payload.userId,
    });

    getIo().emit("queue:update", {
      visitId: sample.visit.visitId,
      status: remaining === 0 ? "SAMPLE_COLLECTED" : sample.visit.status,
      urgency: sample.visit.urgency,
    });
  }

  return sample;
}
