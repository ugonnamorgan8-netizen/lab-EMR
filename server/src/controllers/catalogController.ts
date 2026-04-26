import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function listCatalogHandler(request: Request, response: Response) {
  const category = request.query.category as string | undefined;
  const active = request.query.active ? request.query.active === "true" : undefined;

  const tests = await prisma.testCatalog.findMany({
    where: {
      category: category as never,
      active,
    },
    include: {
      parameters: {
        include: {
          referenceRanges: true,
        },
      },
    },
    orderBy: [{ department: "asc" }, { name: "asc" }],
  });

  return response.json(tests);
}
