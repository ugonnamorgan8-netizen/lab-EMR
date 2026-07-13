import type { SpecimenType, TestCatalog } from "@prisma/client";

export type GroupedSample = {
  specimenType: SpecimenType;
  container: string;
  volume: number;
  tests: TestCatalog[];
};

export function groupTestsBySample(tests: TestCatalog[]) {
  const grouped = new Map<string, GroupedSample>();

  tests.forEach((test) => {
    const specimenType = test.specimenTypes[0] ?? "OTHER";
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
