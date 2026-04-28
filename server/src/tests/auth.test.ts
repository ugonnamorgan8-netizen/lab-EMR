import { describe, expect, it } from "vitest";
import { signAccessToken } from "../middleware/auth.js";

describe("auth token signing", () => {
  it("returns a signed JWT string", () => {
    const token = signAccessToken({
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: "SUPERVISOR",
      department: "IT",
    });

    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });
});
