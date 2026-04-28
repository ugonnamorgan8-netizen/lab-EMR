import { prisma, seedDemoData } from "./seed.js";

async function main() {
  if (process.env.ENABLE_DEMO_SEED !== "true") {
    console.log("Skipping demo seed. Set ENABLE_DEMO_SEED=true to run the destructive demo seed.");
    return;
  }

  await seedDemoData();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
