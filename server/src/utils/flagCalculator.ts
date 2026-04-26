export type RangeInput = {
  normalLow?: number | null;
  normalHigh?: number | null;
  criticalLow?: number | null;
  criticalHigh?: number | null;
};

export type ResultFlagCode = "NORMAL" | "LOW" | "HIGH" | "CRITICAL_LOW" | "CRITICAL_HIGH" | "ABNORMAL";

export function calculateResultFlag(value: number | null, range: RangeInput): ResultFlagCode {
  if (value === null || Number.isNaN(value)) {
    return "ABNORMAL";
  }

  if (range.criticalLow !== null && range.criticalLow !== undefined && value < range.criticalLow) {
    return "CRITICAL_LOW";
  }

  if (range.criticalHigh !== null && range.criticalHigh !== undefined && value > range.criticalHigh) {
    return "CRITICAL_HIGH";
  }

  if (range.normalLow !== null && range.normalLow !== undefined && value < range.normalLow) {
    return "LOW";
  }

  if (range.normalHigh !== null && range.normalHigh !== undefined && value > range.normalHigh) {
    return "HIGH";
  }

  return "NORMAL";
}
