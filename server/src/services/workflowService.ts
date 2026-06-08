import { type Prisma } from "@prisma/client";
import { DeliveryMethod, OrderStatus, QCRule, ReportStatus, ResultFlag, ResultStatus, SampleStatus } from "@shared/index";
import type {
  DispatchReportInput,
  EditResultInput,
  EnterResultInput,
  ProcessingResultEntryInput,
  QcEntryCreateInput,
  SampleWorkflowUpdateInput,
} from "../../../shared/types/index.js";
import { prisma } from "../lib/prisma.js";
import { getIo } from "../socket/socket.js";
import { createNotification } from "./notificationService.js";
import { HttpError } from "../utils/httpError.js";

const PREANALYTICS_STATUSES = [
  SampleStatus.COLLECTED,
  SampleStatus.RECEIVED_LAB,
  SampleStatus.IN_CENTRIFUGE,
  SampleStatus.ALIQUOTED,
] as const;

function midRange(low?: number | null, high?: number | null, fallback = 10) {
  if (low != null && high != null) {
    return Number(((low + high) / 2).toFixed(1));
  }

  if (low != null) {
    return low;
  }

  if (high != null) {
    return high;
  }

  return fallback;
}

function isValidatedOrReported(status: OrderStatus) {
  return status === OrderStatus.VALIDATED || status === OrderStatus.REPORTED;
}

function isBenchProgress(status: OrderStatus) {
  return status === OrderStatus.IN_ANALYSIS || status === OrderStatus.RESULTED;
}

function isClosedProcessingStatus(status: OrderStatus) {
  return status === OrderStatus.VALIDATED || status === OrderStatus.REPORTED || status === OrderStatus.CANCELLED;
}

function isCompletedResultStatus(status: OrderStatus) {
  return status === OrderStatus.RESULTED || status === OrderStatus.VALIDATED || status === OrderStatus.REPORTED;
}

function deriveFlag(range: { normalLow?: number | null; normalHigh?: number | null }, value: number) {
  if (range.normalLow != null && value < range.normalLow) {
    return ResultFlag.LOW;
  }

  if (range.normalHigh != null && value > range.normalHigh) {
    return ResultFlag.HIGH;
  }

  return ResultFlag.NORMAL;
}

function resolveNumericValue(value: string, numericValue?: number) {
  if (numericValue != null && Number.isFinite(numericValue)) {
    return numericValue;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function deriveManualFlag(
  range: { normalLow?: number | null; normalHigh?: number | null; criticalLow?: number | null; criticalHigh?: number | null } | undefined,
  numericValue: number | null,
  providedFlag: EnterResultInput["values"][number]["flag"],
) {
  if (providedFlag !== "NORMAL") {
    return providedFlag as ResultFlag;
  }

  if (numericValue == null) {
    return ResultFlag.NORMAL;
  }

  if (range?.criticalLow != null && numericValue < range.criticalLow) {
    return ResultFlag.CRITICAL_LOW;
  }

  if (range?.criticalHigh != null && numericValue > range.criticalHigh) {
    return ResultFlag.CRITICAL_HIGH;
  }

  return deriveFlag(
    {
      normalLow: range?.normalLow,
      normalHigh: range?.normalHigh,
    },
    numericValue,
  );
}

function formatReferenceRange(
  range:
    | {
        normalLow?: number | null;
        normalHigh?: number | null;
        criticalLow?: number | null;
        criticalHigh?: number | null;
        unit?: string | null;
      }
    | undefined,
) {
  if (!range) {
    return null;
  }

  if (range.normalLow != null || range.normalHigh != null) {
    const low = range.normalLow ?? "-";
    const high = range.normalHigh ?? "-";
    return `${low} - ${high}${range.unit ? ` ${range.unit}` : ""}`;
  }

  if (range.criticalLow != null || range.criticalHigh != null) {
    const low = range.criticalLow ?? "-";
    const high = range.criticalHigh ?? "-";
    return `${low} - ${high}${range.unit ? ` ${range.unit}` : ""}`;
  }

  return null;
}

function validateAndBuildResultValues(
  parameters: Array<{
    id: string;
    name: string;
    referenceRanges: Array<{
      normalLow: number | null;
      normalHigh: number | null;
      criticalLow: number | null;
      criticalHigh: number | null;
    }>;
  }>,
  payloadValues: EnterResultInput["values"],
) {
  const valuesByParameter = new Map(payloadValues.map((value) => [value.parameterId, value]));

  if (valuesByParameter.size !== payloadValues.length) {
    throw new HttpError(400, "Each analyte can only be entered once");
  }

  for (const input of payloadValues) {
    if (!parameters.some((parameter) => parameter.id === input.parameterId)) {
      throw new HttpError(400, "One or more result values do not belong to this test");
    }
  }

  return parameters.map((parameter) => {
    const input = valuesByParameter.get(parameter.id);

    if (!input) {
      throw new HttpError(400, `Enter a value for ${parameter.name}`);
    }

    const range = parameter.referenceRanges[0];
    const numericValue = resolveNumericValue(input.value, input.numericValue);

    return {
      parameterId: parameter.id,
      value: input.value,
      numericValue,
      flag: deriveManualFlag(range, numericValue, input.flag),
      flagNote: input.flagNote || null,
    };
  });
}

function assertSampleWorkflowTransition(current: SampleStatus, next: SampleWorkflowUpdateInput["status"]) {
  const allowed: Record<SampleStatus, SampleStatus[]> = {
    PENDING_COLLECTION: [SampleStatus.COLLECTED],
    COLLECTED: [SampleStatus.RECEIVED_LAB, SampleStatus.DISPOSED],
    IN_TRANSIT: [SampleStatus.RECEIVED_LAB, SampleStatus.DISPOSED],
    RECEIVED_LAB: [SampleStatus.IN_CENTRIFUGE, SampleStatus.ALIQUOTED, SampleStatus.IN_ANALYSIS, SampleStatus.DISPOSED],
    IN_CENTRIFUGE: [SampleStatus.ALIQUOTED, SampleStatus.IN_ANALYSIS, SampleStatus.DISPOSED],
    ALIQUOTED: [SampleStatus.IN_ANALYSIS, SampleStatus.STORED, SampleStatus.DISPOSED],
    IN_ANALYSIS: [SampleStatus.ANALYSIS_COMPLETE, SampleStatus.STORED, SampleStatus.DISPOSED],
    ANALYSIS_COMPLETE: [SampleStatus.STORED, SampleStatus.DISPOSED],
    STORED: [SampleStatus.DISPOSED],
    DISPOSED: [],
  };

  if (!allowed[current]?.includes(next as SampleStatus)) {
    throw new HttpError(400, `Cannot move sample from ${current} to ${next}`);
  }
}

async function syncVisitAfterOrderUpdate(visitId: string) {
  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: {
      samples: {
        include: {
          testOrders: true,
        },
      },
      report: true,
    },
  });

  if (!visit) {
    return null;
  }

  const orders = visit.samples.flatMap((sample) => sample.testOrders);
  let nextStatus = visit.status;

  if (orders.every((order) => order.status === OrderStatus.REPORTED)) {
    nextStatus = "DISPATCHED";
  } else if (orders.every((order) => isValidatedOrReported(order.status))) {
    nextStatus = "VALIDATED";
  } else if (orders.some((order) => isBenchProgress(order.status))) {
    nextStatus = "IN_PROCESSING";
  } else if (visit.samples.every((sample) => sample.status !== SampleStatus.PENDING_COLLECTION)) {
    nextStatus = "SAMPLE_COLLECTED";
  }

  if (nextStatus !== visit.status) {
    await prisma.visit.update({
      where: { id: visitId },
      data: { status: nextStatus },
    });

    getIo().emit("queue:update", {
      visitId: visit.visitId,
      status: nextStatus,
      urgency: visit.urgency,
    });
  }

  return nextStatus;
}

async function syncSampleStatus(sampleId: string) {
  const sample = await prisma.sample.findUnique({
    where: { id: sampleId },
    include: {
      testOrders: true,
    },
  });

  if (!sample) {
    return null;
  }

  const nextStatus = sample.testOrders.every((order) => isCompletedResultStatus(order.status))
    ? SampleStatus.ANALYSIS_COMPLETE
    : sample.testOrders.some((order) => order.status === OrderStatus.IN_ANALYSIS)
      ? SampleStatus.IN_ANALYSIS
      : sample.status;

  if (nextStatus !== sample.status) {
    await prisma.sample.update({
      where: { id: sampleId },
      data: { status: nextStatus },
    });
  }

  return nextStatus;
}

export async function listPreanalyticsSamples() {
  return prisma.sample.findMany({
    where: {
      status: {
        in: [...PREANALYTICS_STATUSES],
      },
    },
    orderBy: [{ visit: { urgency: "desc" } }, { collectedAt: "desc" }],
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

export async function updateSampleWorkflow(sampleId: string, payload: SampleWorkflowUpdateInput) {
  const sample = await prisma.sample.findUniqueOrThrow({
    where: { id: sampleId },
    include: {
      visit: true,
      testOrders: true,
    },
  });

  assertSampleWorkflowTransition(sample.status, payload.status);

  const updated = await prisma.sample.update({
    where: { id: sampleId },
    data: {
      status: payload.status as SampleStatus,
    },
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

  if (payload.status === "IN_ANALYSIS") {
    await prisma.visit.update({
      where: { id: sample.visitId },
      data: { status: "IN_PROCESSING" },
    });
  }

  getIo().emit("queue:update", {
    visitId: sample.visit.visitId,
    status: payload.status === "IN_ANALYSIS" ? "IN_PROCESSING" : sample.visit.status,
    urgency: sample.visit.urgency,
  });

  return updated;
}

export async function listProcessingWorklist() {
  return prisma.testOrder.findMany({
    where: {
      status: {
        in: [OrderStatus.PENDING, OrderStatus.IN_ANALYSIS, OrderStatus.RESULTED],
      },
    },
    orderBy: [{ urgency: "desc" }, { tatDeadline: "asc" }, { orderedAt: "desc" }],
    include: {
      sample: {
        include: {
          visit: {
            include: {
              patient: true,
            },
          },
        },
      },
      testCatalog: {
        include: {
          parameters: {
            include: {
              referenceRanges: true,
            },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
      result: {
        include: {
          values: {
            include: {
              parameter: true,
            },
          },
        },
      },
    },
  });
}

export async function startOrderAnalysis(orderId: string) {
  const order = await prisma.testOrder.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      sample: {
        include: {
          visit: true,
        },
      },
    },
  });

  if (isClosedProcessingStatus(order.status)) {
    throw new HttpError(400, "This test order can no longer be moved into analysis");
  }

  const updated = await prisma.testOrder.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.IN_ANALYSIS,
      sample: {
        update: {
          status: SampleStatus.IN_ANALYSIS,
        },
      },
    },
    include: {
      sample: {
        include: {
          visit: {
            include: {
              patient: true,
            },
          },
        },
      },
      testCatalog: true,
      result: true,
    },
  });

  await prisma.visit.update({
    where: { id: order.sample.visitId },
    data: { status: "IN_PROCESSING" },
  });

  getIo().emit("queue:update", {
    visitId: order.sample.visit.visitId,
    status: "IN_PROCESSING",
    urgency: order.sample.visit.urgency,
  });

  return updated;
}

export async function enterProcessingResult(orderId: string, payload: ProcessingResultEntryInput, userId: string) {
  const order = await prisma.testOrder.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      sample: {
        include: {
          visit: true,
        },
      },
      testCatalog: {
        include: {
          parameters: {
            include: {
              referenceRanges: true,
            },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
      result: true,
    },
  });

  if (isClosedProcessingStatus(order.status)) {
    throw new HttpError(400, "This test order can no longer accept new results");
  }

  if (!order.testCatalog.parameters.length) {
    throw new HttpError(400, "This test has no parameters configured");
  }

  const values = order.testCatalog.parameters.map((parameter, index) => {
    const range = parameter.referenceRanges[0];
    const numericValue = midRange(range?.normalLow, range?.normalHigh, 10 + index);
    return {
      parameterId: parameter.id,
      value: Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(1),
      numericValue,
      flag: deriveFlag(
        {
          normalLow: range?.normalLow,
          normalHigh: range?.normalHigh,
        },
        numericValue,
      ),
    };
  });

  const result = await prisma.testResult.upsert({
    where: { testOrderId: orderId },
    update: {
      status: ResultStatus.ENTERED,
      enteredAt: new Date(),
      enteredBy: userId,
      method: payload.method || null,
      instrument: payload.instrument || null,
      technicianNote: payload.technicianNote || null,
      deltaCheckPassed: true,
      values: {
        deleteMany: {},
        create: values,
      },
    },
    create: {
      testOrderId: orderId,
      status: ResultStatus.ENTERED,
      enteredAt: new Date(),
      enteredBy: userId,
      method: payload.method || null,
      instrument: payload.instrument || null,
      technicianNote: payload.technicianNote || null,
      deltaCheckPassed: true,
      values: {
        create: values,
      },
    },
    include: {
      values: {
        include: {
          parameter: true,
        },
      },
      testOrder: {
        include: {
          sample: {
            include: {
              visit: true,
            },
          },
          testCatalog: true,
        },
      },
    },
  });

  await prisma.testOrder.update({
    where: { id: orderId },
    data: { status: OrderStatus.RESULTED },
  });

  await syncSampleStatus(order.sampleId);
  await syncVisitAfterOrderUpdate(order.sample.visitId);

  return result;
}

export async function enterManualResult(orderId: string, payload: EnterResultInput, userId: string) {
  const order = await prisma.testOrder.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      sample: {
        include: {
          visit: true,
        },
      },
      testCatalog: {
        include: {
          parameters: {
            include: {
              referenceRanges: true,
            },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
      result: true,
    },
  });

  if (
    order.status === OrderStatus.VALIDATED ||
    order.status === OrderStatus.REPORTED ||
    order.status === OrderStatus.CANCELLED
  ) {
    throw new HttpError(400, "This test order can no longer accept direct result entry");
  }

  if (!order.testCatalog.parameters.length) {
    throw new HttpError(400, "This test has no parameters configured");
  }

  const values = validateAndBuildResultValues(order.testCatalog.parameters, payload.values);

  const result = await prisma.testResult.upsert({
    where: { testOrderId: orderId },
    update: {
      status: ResultStatus.ENTERED,
      interpretation: payload.interpretation || null,
      method: payload.method || null,
      instrument: payload.instrument || null,
      technicianNote: payload.technicianNote || null,
      enteredAt: new Date(),
      enteredBy: userId,
      validatedAt: null,
      validatedById: null,
      deltaCheckPassed: true,
      deltaCheckNote: null,
      values: {
        deleteMany: {},
        create: values,
      },
    },
    create: {
      testOrderId: orderId,
      status: ResultStatus.ENTERED,
      interpretation: payload.interpretation || null,
      method: payload.method || null,
      instrument: payload.instrument || null,
      technicianNote: payload.technicianNote || null,
      enteredAt: new Date(),
      enteredBy: userId,
      deltaCheckPassed: true,
      values: {
        create: values,
      },
    },
    include: {
      values: {
        include: {
          parameter: true,
        },
      },
      testOrder: {
        include: {
          sample: {
            include: {
              visit: true,
            },
          },
          testCatalog: true,
        },
      },
    },
  });

  await prisma.testOrder.update({
    where: { id: orderId },
    data: { status: OrderStatus.RESULTED },
  });

  await syncSampleStatus(order.sampleId);
  await syncVisitAfterOrderUpdate(order.sample.visitId);

  return result;
}

export async function editResult(resultId: string, payload: EditResultInput, _userId: string) {
  const currentResult = await prisma.testResult.findUniqueOrThrow({
    where: { id: resultId },
    include: {
      testOrder: {
        include: {
          sample: {
            include: {
              visit: {
                include: {
                  report: true,
                },
              },
            },
          },
          testCatalog: {
            include: {
              parameters: {
                include: {
                  referenceRanges: true,
                },
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (currentResult.testOrder.status === OrderStatus.CANCELLED) {
    throw new HttpError(400, "Cancelled orders cannot be amended");
  }

  const values = validateAndBuildResultValues(currentResult.testOrder.testCatalog.parameters, payload.values);

  const result = await prisma.testResult.update({
    where: { id: resultId },
    data: {
      status: ResultStatus.AMENDED,
      interpretation: payload.interpretation || null,
      method: payload.method || currentResult.method || null,
      instrument: payload.instrument || currentResult.instrument || null,
      technicianNote: payload.technicianNote || null,
      enteredAt: new Date(),
      validatedAt: null,
      validatedById: null,
      deltaCheckPassed: true,
      deltaCheckNote: payload.amendmentNote,
      values: {
        deleteMany: {},
        create: values,
      },
    },
    include: {
      values: {
        include: {
          parameter: true,
        },
      },
      testOrder: {
        include: {
          sample: {
            include: {
              visit: true,
            },
          },
          testCatalog: true,
        },
      },
    },
  });

  await prisma.testOrder.update({
    where: { id: currentResult.testOrderId },
    data: { status: OrderStatus.RESULTED },
  });

  if (currentResult.testOrder.sample.visit.report) {
    await prisma.report.update({
      where: { visitId: currentResult.testOrder.sample.visitId },
      data: {
        status: ReportStatus.AMENDED,
        amendmentNote: payload.amendmentNote,
        amendedAt: new Date(),
      },
    });
  }

  await syncSampleStatus(currentResult.testOrder.sampleId);
  await syncVisitAfterOrderUpdate(currentResult.testOrder.sample.visitId);

  return result;
}

export async function listValidationQueue() {
  return prisma.testResult.findMany({
    where: {
      status: {
        in: [ResultStatus.ENTERED, ResultStatus.AMENDED, ResultStatus.DELTA_CHECK_FAILED, ResultStatus.QC_FAILED],
      },
    },
    orderBy: [{ enteredAt: "desc" }, { createdAt: "desc" }],
    include: {
      values: {
        include: {
          parameter: true,
        },
      },
      testOrder: {
        include: {
          testCatalog: true,
          sample: {
            include: {
              visit: {
                include: {
                  patient: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function validateResult(orderId: string, userId: string) {
  const order = await prisma.testOrder.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      sample: {
        include: {
          visit: true,
        },
      },
      result: true,
    },
  });

  if (!order.result) {
    throw new HttpError(400, "No entered result exists for this order yet");
  }

  if (isValidatedOrReported(order.status)) {
    throw new HttpError(400, "This result has already been validated");
  }

  const result = await prisma.testResult.update({
    where: { testOrderId: orderId },
    data: {
      status: ResultStatus.VALIDATED,
      validatedAt: new Date(),
      validatedById: userId,
      deltaCheckPassed: true,
    },
    include: {
      values: {
        include: {
          parameter: true,
        },
      },
      testOrder: {
        include: {
          testCatalog: true,
          sample: {
            include: {
              visit: {
                include: {
                  patient: true,
                },
              },
            },
          },
        },
      },
    },
  });

  await prisma.testOrder.update({
    where: { id: orderId },
    data: { status: OrderStatus.VALIDATED },
  });

  await syncSampleStatus(order.sampleId);
  await syncVisitAfterOrderUpdate(order.sample.visitId);

  return result;
}

export async function getQcDashboard() {
  const materials = await prisma.qCMaterial.findMany({
    include: {
      testCatalog: true,
      entries: {
        orderBy: { runDate: "desc" },
        take: 8,
        include: {
          enteredBy: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: [{ active: "desc" }, { expiryDate: "asc" }],
  });

  const allEntries = materials.flatMap((material) => material.entries);
  const warnings = allEntries.filter((entry) => entry.rule === QCRule.WARNING_1_2S).length;
  const rejects = allEntries.filter((entry) => entry.rule !== QCRule.IN_CONTROL && entry.rule !== QCRule.WARNING_1_2S).length;

  return {
    summary: {
      activeMaterials: materials.filter((material) => material.active).length,
      warningRuns: warnings,
      rejectedRuns: rejects,
      expiringSoon: materials.filter((material) => {
        const days = (material.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return days <= 30;
      }).length,
    },
    materials: materials.map((material) => ({
      id: material.id,
      name: material.name,
      level: material.level,
      lotNumber: material.lotNumber,
      expiryDate: material.expiryDate.toISOString(),
      targetMean: material.targetMean,
      targetSD: material.targetSD,
      active: material.active,
      testCatalog: {
        id: material.testCatalog.id,
        code: material.testCatalog.code,
        name: material.testCatalog.name,
        department: material.testCatalog.department,
      },
      entries: material.entries.map((entry) => ({
        id: entry.id,
        value: entry.value,
        zScore: entry.zScore,
        rule: entry.rule,
        note: entry.note,
        runDate: entry.runDate.toISOString(),
        enteredBy: entry.enteredBy.name,
      })),
    })),
  };
}

export async function createQcRun(materialId: string, payload: QcEntryCreateInput, userId: string) {
  const material = await prisma.qCMaterial.findUniqueOrThrow({
    where: { id: materialId },
    include: {
      testCatalog: true,
    },
  });

  const zScore = Number(((payload.value - material.targetMean) / material.targetSD).toFixed(2));
  const rule =
    Math.abs(zScore) > 3
      ? QCRule.REJECT_1_3S
      : Math.abs(zScore) > 2
        ? QCRule.WARNING_1_2S
        : QCRule.IN_CONTROL;

  const entry = await prisma.qCEntry.create({
    data: {
      qcMaterialId: materialId,
      value: payload.value,
      zScore,
      rule,
      note: payload.note,
      enteredById: userId,
    },
    include: {
      enteredBy: {
        select: {
          name: true,
        },
      },
      qcMaterial: {
        include: {
          testCatalog: true,
        },
      },
    },
  });

  if (rule !== QCRule.IN_CONTROL) {
    const managers = await prisma.user.findMany({
      where: {
        role: {
          in: ["LAB_SCIENTIST", "SUPERVISOR"],
        },
      },
      select: {
        id: true,
      },
    });

    await Promise.all(
      managers.map((manager) =>
        createNotification({
          userId: manager.id,
          type: rule === QCRule.WARNING_1_2S ? "QC_FAILURE" : "QC_FAILURE",
          title: `QC ${rule === QCRule.WARNING_1_2S ? "warning" : "rejection"} recorded`,
          message: `${material.name} for ${material.testCatalog.name} returned ${payload.value} (${rule})`,
          resourceLink: "/qc/dashboard",
        }),
      ),
    );
  }

  return {
    id: entry.id,
    value: entry.value,
    zScore: entry.zScore,
    rule: entry.rule,
    note: entry.note,
    runDate: entry.runDate.toISOString(),
    enteredBy: entry.enteredBy.name,
    material: {
      id: entry.qcMaterial.id,
      name: entry.qcMaterial.name,
      level: entry.qcMaterial.level,
      testName: entry.qcMaterial.testCatalog.name,
    },
  };
}

export async function listDispatchQueue() {
  return prisma.visit.findMany({
    where: {
      OR: [
        { status: "VALIDATED" },
        { status: "DISPATCHED" },
        { report: { is: { status: { in: [ReportStatus.GENERATED, ReportStatus.DISPATCHED] } } } },
      ],
    },
    orderBy: [{ registeredAt: "desc" }],
    include: {
      patient: true,
      report: true,
      invoice: true,
      samples: {
        include: {
          testOrders: {
            include: {
              testCatalog: true,
            },
          },
        },
      },
    },
  });
}

export async function generateReport(visitId: string) {
  const visit = await prisma.visit.findUniqueOrThrow({
    where: { id: visitId },
    include: {
      patient: true,
      report: true,
      samples: {
        include: {
          testOrders: true,
        },
      },
    },
  });

  const orders = visit.samples.flatMap((sample) => sample.testOrders);
  const hasPendingValidation = orders.some((order) => !isValidatedOrReported(order.status));

  if (hasPendingValidation) {
    throw new HttpError(400, "All test orders must be validated before report generation");
  }

  const report = visit.report
    ? await prisma.report.update({
        where: { visitId },
        data: {
          generatedAt: visit.report.generatedAt ?? new Date(),
          status: ReportStatus.GENERATED,
          pdfUrl: visit.report.pdfUrl ?? `/reports/${visit.visitId}.pdf`,
        },
      })
    : await prisma.report.create({
        data: {
          reportId: `RPT-${visit.visitId}`,
          visitId,
          generatedAt: new Date(),
          status: ReportStatus.GENERATED,
          pdfUrl: `/reports/${visit.visitId}.pdf`,
        },
      });

  return {
    id: report.id,
    reportId: report.reportId,
    generatedAt: report.generatedAt?.toISOString() ?? null,
    dispatchedAt: report.dispatchedAt?.toISOString() ?? null,
    status: report.status,
    pdfUrl: report.pdfUrl,
  };
}

export async function dispatchReport(visitId: string, payload: DispatchReportInput, userId: string) {
  const visit = await prisma.visit.findUniqueOrThrow({
    where: { id: visitId },
    include: {
      report: true,
      samples: {
        include: {
          testOrders: true,
        },
      },
    },
  });

  if (!visit.report) {
    await generateReport(visitId);
  }

  const report = await prisma.report.update({
    where: { visitId },
    data: {
      generatedAt: visit.report?.generatedAt ?? new Date(),
      dispatchedAt: new Date(),
      dispatchedById: userId,
      deliveryMethod: [payload.deliveryMethod as DeliveryMethod],
      status: ReportStatus.DISPATCHED,
    },
  });

  await prisma.testOrder.updateMany({
    where: {
      sample: {
        visitId,
      },
      status: OrderStatus.VALIDATED,
    },
    data: {
      status: OrderStatus.REPORTED,
    },
  });

  await prisma.visit.update({
    where: { id: visitId },
    data: { status: "DISPATCHED" },
  });

  return {
    id: report.id,
    reportId: report.reportId,
    generatedAt: report.generatedAt?.toISOString() ?? null,
    dispatchedAt: report.dispatchedAt?.toISOString() ?? null,
    status: report.status,
    pdfUrl: report.pdfUrl,
    deliveryMethod: report.deliveryMethod,
  };
}

export async function getBillingDashboard() {
  const [aggregate, payments, invoices] = await Promise.all([
    prisma.invoice.aggregate({
      _sum: {
        totalAmount: true,
        patientBalance: true,
      },
      _count: {
        id: true,
      },
    }),
    prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
    }),
    prisma.invoice.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: {
        patient: true,
        visit: true,
        payments: true,
      },
      take: 25,
    }),
  ]);

  const outstanding = invoices.filter((invoice) => invoice.patientBalance > 0);

  return {
    summary: {
      totalInvoices: aggregate._count.id,
      grossRevenue: aggregate._sum.totalAmount ?? 0,
      collectedRevenue: payments._sum.amount ?? 0,
      outstandingBalance: aggregate._sum.patientBalance ?? 0,
      unpaidCount: outstanding.filter((invoice) => invoice.status === "UNPAID").length,
      partialCount: outstanding.filter((invoice) => invoice.status === "PARTIAL").length,
    },
    invoices: invoices.map((invoice) => ({
      id: invoice.id,
      invoiceId: invoice.invoiceId,
      visitId: invoice.visitId,
      patientName: `${invoice.patient.firstName} ${invoice.patient.lastName}`,
      visitRef: invoice.visit.visitId,
      totalAmount: invoice.totalAmount,
      patientBalance: invoice.patientBalance,
      status: invoice.status,
      paymentCount: invoice.payments.length,
      createdAt: invoice.createdAt.toISOString(),
      paidAt: invoice.paidAt?.toISOString() ?? null,
    })),
  };
}

export async function listOutstandingInvoices() {
  const invoices = await prisma.invoice.findMany({
    where: {
      patientBalance: {
        gt: 0,
      },
    },
    orderBy: [{ patientBalance: "desc" }, { createdAt: "desc" }],
    include: {
      patient: true,
      visit: true,
      payments: true,
    },
  });

  return invoices.map((invoice) => ({
    id: invoice.id,
    invoiceId: invoice.invoiceId,
    visitId: invoice.visitId,
    patientName: `${invoice.patient.firstName} ${invoice.patient.lastName}`,
    patientPhone: invoice.patient.phone,
    visitRef: invoice.visit.visitId,
    totalAmount: invoice.totalAmount,
    patientBalance: invoice.patientBalance,
    status: invoice.status,
    paymentCount: invoice.payments.length,
    createdAt: invoice.createdAt.toISOString(),
  }));
}

export async function getVisitResults(visitId: string) {
  const [visit, settings] = await Promise.all([
    prisma.visit.findUniqueOrThrow({
      where: { id: visitId },
      include: {
        patient: true,
        invoice: true,
        report: true,
        samples: {
          include: {
            testOrders: {
              include: {
                testCatalog: {
                  include: {
                    parameters: {
                      include: {
                        referenceRanges: true,
                      },
                      orderBy: { sortOrder: "asc" },
                    },
                  },
                },
                result: {
                  include: {
                    values: {
                      include: {
                        parameter: {
                          include: {
                            referenceRanges: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
              orderBy: [{ orderedAt: "desc" }],
            },
          },
          orderBy: [{ createdAt: "desc" }],
        },
      },
    }),
    prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            "lab.name",
            "lab.address",
            "lab.phone",
            "lab.email",
            "lab.website",
            "lab.director",
            "lab.accreditation",
            "lab.tagline",
            "lab.logoUrl",
          ],
        },
      },
    }),
  ]);

  const settingsMap = Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));
  const orders = visit.samples.flatMap((sample) => sample.testOrders);

  return {
    lab: {
      name: settingsMap["lab.name"] ?? "PHENOM LABS",
      address: settingsMap["lab.address"] ?? "",
      phone: settingsMap["lab.phone"] ?? "",
      email: settingsMap["lab.email"] ?? "",
      website: settingsMap["lab.website"] ?? "",
      director: settingsMap["lab.director"] ?? "",
      accreditation: settingsMap["lab.accreditation"] ?? "",
      tagline: settingsMap["lab.tagline"] ?? "",
      logoUrl: settingsMap["lab.logoUrl"] ?? "",
    },
    visit: {
      id: visit.id,
      visitId: visit.visitId,
      status: visit.status,
      urgency: visit.urgency,
      registeredAt: visit.registeredAt.toISOString(),
      type: visit.type,
      patient: {
        id: visit.patient.id,
        patientId: visit.patient.patientId,
        firstName: visit.patient.firstName,
        lastName: visit.patient.lastName,
        gender: visit.patient.gender,
        phone: visit.patient.phone,
        email: visit.patient.email,
        dateOfBirth: visit.patient.dateOfBirth.toISOString(),
        referringDoctor: visit.referringDoctor ?? visit.patient.referringDoctor,
        referringFacility: visit.referringFacility ?? visit.patient.referringFacility,
        clinicalHistory: visit.clinicalHistory ?? visit.patient.clinicalHistory,
      },
      invoice: visit.invoice
        ? {
            invoiceId: visit.invoice.invoiceId,
            status: visit.invoice.status,
            totalAmount: visit.invoice.totalAmount,
            patientBalance: visit.invoice.patientBalance,
          }
        : null,
      report: visit.report
        ? {
            reportId: visit.report.reportId,
            status: visit.report.status,
            generatedAt: visit.report.generatedAt?.toISOString() ?? null,
            dispatchedAt: visit.report.dispatchedAt?.toISOString() ?? null,
            amendmentNote: visit.report.amendmentNote,
            amendedAt: visit.report.amendedAt?.toISOString() ?? null,
          }
        : null,
    },
    tests: orders.map((order) => ({
      id: order.id,
      orderId: order.orderId,
      status: order.status,
      department: order.testCatalog.department,
      test: {
        code: order.testCatalog.code,
        name: order.testCatalog.name,
      },
      interpretation: order.result?.interpretation ?? null,
      method: order.result?.method ?? null,
      instrument: order.result?.instrument ?? null,
      technicianNote: order.result?.technicianNote ?? null,
      validatedAt: order.result?.validatedAt?.toISOString() ?? null,
      values:
        order.result?.values.map((value) => ({
          id: value.id,
          parameterName: value.parameter.name,
          value: value.value,
          numericValue: value.numericValue,
          unit: value.parameter.unit,
          flag: value.flag,
          flagNote: value.flagNote,
          referenceRange: formatReferenceRange(value.parameter.referenceRanges[0]),
        })) ?? [],
    })),
    summary: {
      sampleCount: visit.samples.length,
      testCount: orders.length,
      resultedCount: orders.filter((order) => order.result != null).length,
      validatedCount: orders.filter((order) => isValidatedOrReported(order.status)).length,
    },
  };
}
