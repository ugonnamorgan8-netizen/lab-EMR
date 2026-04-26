import { describe, expect, it, vi } from "vitest";
import { requireRole } from "../middleware/rbac.js";

describe("requireRole", () => {
  it("allows permitted roles", () => {
    const next = vi.fn();
    const middleware = requireRole(["ADMIN"]);
    middleware({ user: { role: "ADMIN" } } as never, {} as never, next);
    expect(next).toHaveBeenCalled();
  });
});
