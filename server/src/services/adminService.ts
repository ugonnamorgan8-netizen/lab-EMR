import { OrderStatus, Role, UserStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

function startOfToday() {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  return value;
}

function isOutstandingOrder(status: OrderStatus) {
  return status !== OrderStatus.VALIDATED && status !== OrderStatus.REPORTED && status !== OrderStatus.CANCELLED;
}

export async function getAdminAnalytics() {
  const today = startOfToday();
  const now = new Date();

  const [
    totalPatients,
    visitsToday,
    activeVisits,
    pendingSamples,
    testsInAnalysis,
    reportsGenerated,
    paymentsAggregate,
    invoicesAggregate,
    allVisits,
    visits,
    testOrders,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.visit.count({ where: { registeredAt: { gte: today } } }),
    prisma.visit.count({
      where: {
        status: {
          in: ["REGISTERED", "SAMPLE_COLLECTED", "IN_PROCESSING", "AWAITING_QC"],
        },
      },
    }),
    prisma.sample.count({ where: { status: "PENDING_COLLECTION" } }),
    prisma.testOrder.count({ where: { status: "IN_ANALYSIS" } }),
    prisma.report.count({ where: { status: { in: ["GENERATED", "DISPATCHED"] } } }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.invoice.aggregate({ _sum: { patientBalance: true } }),
    prisma.visit.findMany({
      select: {
        status: true,
        urgency: true,
      },
    }),
    prisma.visit.findMany({
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        samples: {
          include: {
            testOrders: {
              include: {
                testCatalog: {
                  select: {
                    department: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { registeredAt: "desc" },
      take: 6,
    }),
    prisma.testOrder.findMany({
      select: {
        status: true,
        tatDeadline: true,
        urgency: true,
        testCatalog: {
          select: {
            department: true,
          },
        },
      },
    }),
  ]);

  const visitStatusBreakdownMap = new Map<string, number>();
  const urgencyBreakdownMap = new Map<string, number>();
  const departmentVolumeMap = new Map<string, number>();
  let tatBreaches = 0;

  for (const visit of allVisits) {
    visitStatusBreakdownMap.set(visit.status, (visitStatusBreakdownMap.get(visit.status) ?? 0) + 1);
    urgencyBreakdownMap.set(visit.urgency, (urgencyBreakdownMap.get(visit.urgency) ?? 0) + 1);
  }

  for (const order of testOrders) {
    const department = order.testCatalog.department;
    departmentVolumeMap.set(department, (departmentVolumeMap.get(department) ?? 0) + 1);
    if (order.tatDeadline && order.tatDeadline < now && isOutstandingOrder(order.status)) {
      tatBreaches += 1;
    }
  }

  return {
    generatedAt: now.toISOString(),
    metrics: {
      totalPatients,
      visitsToday,
      activeVisits,
      pendingSamples,
      testsInAnalysis,
      reportsGenerated,
      tatBreaches,
      revenueCollected: paymentsAggregate._sum.amount ?? 0,
      outstandingBalance: invoicesAggregate._sum.patientBalance ?? 0,
    },
    visitStatusBreakdown: Array.from(visitStatusBreakdownMap.entries()).map(([status, count]) => ({
      status,
      count,
    })),
    urgencyBreakdown: Array.from(urgencyBreakdownMap.entries()).map(([urgency, count]) => ({
      urgency,
      count,
    })),
    departmentVolumes: Array.from(departmentVolumeMap.entries())
      .map(([department, count]) => ({
        department,
        count,
      }))
      .sort((left, right) => right.count - left.count),
    recentVisits: visits.map((visit) => ({
      id: visit.id,
      visitId: visit.visitId,
      patientName: `${visit.patient.firstName} ${visit.patient.lastName}`,
      urgency: visit.urgency,
      status: visit.status,
      registeredAt: visit.registeredAt.toISOString(),
      testCount: visit.samples.reduce((sum, sample) => sum + sample.testOrders.length, 0),
    })),
  };
}

export async function listAdminUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      status: true,
      lastLogin: true,
      createdAt: true,
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  const byRole = Object.fromEntries(
    Object.values(Role).map((role) => [role, users.filter((user) => user.role === role).length]),
  ) as Record<Role, number>;

  const byStatus = Object.fromEntries(
    Object.values(UserStatus).map((status) => [status, users.filter((user) => user.status === status).length]),
  ) as Record<UserStatus, number>;

  return {
    totals: {
      total: users.length,
      active: byStatus.ACTIVE,
      inactive: byStatus.INACTIVE,
      suspended: byStatus.SUSPENDED,
    },
    byRole,
    users: users.map((user) => ({
      ...user,
      lastLogin: user.lastLogin?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    })),
  };
}

export async function listSystemSettings() {
  const [settings, footprint] = await Promise.all([
    prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    }),
    Promise.all([
      prisma.user.count(),
      prisma.patient.count(),
      prisma.testCatalog.count(),
      prisma.testPanel.count(),
      prisma.auditLog.count(),
    ]),
  ]);

  const [userCount, patientCount, catalogCount, panelCount, auditCount] = footprint;

  return {
    settings: settings.map((setting) => ({
      key: setting.key,
      value: setting.value,
      updatedAt: setting.updatedAt.toISOString(),
    })),
    footprint: {
      userCount,
      patientCount,
      catalogCount,
      panelCount,
      auditCount,
    },
  };
}

export async function getAdminCatalog() {
  const [tests, panels] = await Promise.all([
    prisma.testCatalog.findMany({
      include: {
        parameters: {
          include: {
            referenceRanges: true,
          },
        },
      },
      orderBy: [{ department: "asc" }, { name: "asc" }],
    }),
    prisma.testPanel.findMany({
      include: {
        items: {
          include: {
            testCatalog: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ active: "desc" }, { name: "asc" }],
    }),
  ]);

  const categories = tests.reduce<Record<string, number>>((accumulator, test) => {
    accumulator[test.category] = (accumulator[test.category] ?? 0) + 1;
    return accumulator;
  }, {});

  return {
    summary: {
      totalTests: tests.length,
      activeTests: tests.filter((test) => test.active).length,
      totalPanels: panels.length,
      activePanels: panels.filter((panel) => panel.active).length,
    },
    categories,
    tests: tests.map((test) => ({
      id: test.id,
      code: test.code,
      name: test.name,
      category: test.category,
      department: test.department,
      specimenTypes: test.specimenTypes,
      container: test.container,
      price: test.price,
      active: test.active,
      sampleVolume: test.sampleVolume,
      parameterCount: test.parameters.length,
      referenceRangeCount: test.parameters.reduce((sum, parameter) => sum + parameter.referenceRanges.length, 0),
    })),
    panels: panels.map((panel) => ({
      id: panel.id,
      code: panel.code,
      name: panel.name,
      description: panel.description,
      price: panel.price,
      active: panel.active,
      testCount: panel.items.length,
      tests: panel.items.map((item) => item.testCatalog),
    })),
  };
}

export async function listAuditLogs() {
  const logs = await prisma.auditLog.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    resourceType: log.resourceType,
    resourceId: log.resourceId,
    ipAddress: log.ipAddress,
    metadata: log.metadata,
    createdAt: log.createdAt.toISOString(),
    user: log.user,
  }));
}
