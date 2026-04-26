import { describe, expect, it } from "vitest";
import { calculateResultFlag } from "../utils/flagCalculator.js";

describe("calculateResultFlag", () => {
  const range = {
    normalLow: 10,
    normalHigh: 20,
    criticalLow: 5,
    criticalHigh: 30,
  };

  it("returns critical low for values below critical lower bound", () => {
    expect(calculateResultFlag(4, range)).toBe("CRITICAL_LOW");
  });

  it("returns low for values below normal lower bound", () => {
    expect(calculateResultFlag(8, range)).toBe("LOW");
  });

  it("returns normal for in-range values", () => {
    expect(calculateResultFlag(14, range)).toBe("NORMAL");
  });

  it("returns critical high for values above critical high", () => {
    expect(calculateResultFlag(32, range)).toBe("CRITICAL_HIGH");
  });
});
