import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Consulta Veterinaria", color: "#10b981" },
  { name: "Emergencia", color: "#ef4444" },
  { name: "Peluquería", color: "#3b82f6" },
  { name: "Vacunación", color: "#8b5cf6" },
  { name: "Cirugía", color: "#f97316" },
  { name: "Laboratorio", color: "#06b6d4" },
  { name: "Otro", color: "#6b7280" },
];

async function main() {
  console.log("Seeding categories...");

  for (const cat of categories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          color: cat.color,
        },
      });
      console.log(`  Created: ${cat.name}`);
    } else {
      console.log(`  Already exists: ${cat.name}`);
    }
  }

  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });