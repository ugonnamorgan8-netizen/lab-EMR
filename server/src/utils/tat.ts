import type { TestCatalog } from "@prisma/client";
import type { Urgency } from "@shared/index";

export function calculateTatDeadline(test: TestCatalog, urgency: Urgency, startAt = new Date()) {
  const hours =
    urgency === "STAT"
      ? test.tatHoursStat
      : urgency === "URGENT"
        ? test.tatHoursUrgent
        : test.tatHoursRoutine;

  return new Date(startAt.getTime() + hours * 60 * 60 * 1000);
}
