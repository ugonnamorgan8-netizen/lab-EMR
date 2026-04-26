import { describe, expect, it } from "vitest";
import { calculateDeltaCheck, isDeltaCheckWithinLimit } from "../utils/deltaCheck.js";

describe("delta check", () => {
  it("calculates percentage change", () => {
    expect(calculateDeltaCheck(10, 15)).toEqual({
      difference: 5,
      percentChange: 50,
    });
  });

  it("fails when over the configured threshold", () => {
    expect(isDeltaCheckWithinLimit(10, 20, 30)).toBe(false);
  });
});
