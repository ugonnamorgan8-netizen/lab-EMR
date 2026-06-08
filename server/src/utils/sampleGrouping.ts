import type { TestCatalog } from "@prisma/client";
import type { SpecimenType } from "@shared/index";

export type GroupedSample = {
  specimenType: SpecimenType;
  container: string;
  volume: number;
  tests: TestCatalog[];
};

export function groupTestsBySample(tests: TestCatalog[]) {
  const grouped = new Map<string, GroupedSample>();

  tests.forEach((test) => {
    const specimenTypesArr: string[] = JSON.parse((test.specimenTypes as string) || "[]");
    const specimenType = (specimenTypesArr[0] ?? "OTHER") as SpecimenType;
    const key = `${specimenType}:${test.container}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.tests.push(test);
      existing.volume += test.sampleVolume;
      return;
    }

    grouped.set(key, {
      specimenType,
      container: test.container,
      volume: test.sampleVolume,
      tests: [test],
    });
  });

  return Array.from(grouped.values());
}
