import { describe, expect, it } from "vitest";
import { applyWestgardRules } from "../utils/westgard.js";

describe("applyWestgardRules", () => {
  it("returns warning for a 1-2s breach", () => {
    expect(applyWestgardRules([{ zScore: 0.2 }, { zScore: 2.3 }])).toBe("WARNING_1_2S");
  });

  it("returns reject for a 1-3s breach", () => {
    expect(applyWestgardRules([{ zScore: 3.2 }])).toBe("REJECT_1_3S");
  });

  it("returns reject for 2-2s", () => {
    expect(applyWestgardRules([{ zScore: 2.4 }, { zScore: 2.5 }])).toBe("REJECT_2_2S");
  });
});
