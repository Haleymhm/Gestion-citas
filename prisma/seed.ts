import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

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

const adminUser = {
  email: "administrator@veteriapp.dev",
  password: "Admin1234!",
  firstName: "Administrador",
  lastName: "VeteriApp",
  rut: "11111111-1",
  phone: "+56 2 2345 6789",
  role: Role.ADMIN,
};

const regions = [
  { code: "I", name: "Región de Tarapacá" },
  { code: "II", name: "Región de Antofagasta" },
  { code: "III", name: "Región de Atacama" },
  { code: "IV", name: "Región de Coquimbo" },
  { code: "V", name: "Región de Valparaíso" },
  { code: "RM", name: "Región Metropolitana de Santiago" },
  { code: "VI", name: "Región del Libertador General Bernardo O’Higgins" },
  { code: "VII", name: "Región del Maule" },
  { code: "VIII", name: "Región del Biobío" },
  { code: "IX", name: "Región de La Araucanía" },
  { code: "X", name: "Región de Los Lagos" },
  { code: "XI", name: "Región de Aysén del General Carlos Ibáñez del Campo" },
  { code: "XII", name: "Región de Magallanes y de la Antártica Chilena" },
  { code: "XIV", name: "Región de Los Ríos" },
  { code: "XV", name: "Región de Arica y Parinacota" },
  { code: "XVI", name: "Región de Ñuble" },
];

async function seedCategories() {
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
}

async function seedRegions() {
  console.log("\nSeeding regions...");

  for (const region of regions) {
    const existing = await prisma.region.findFirst({
      where: { code: region.code },
    });

    if (!existing) {
      await prisma.region.create({
        data: {
          code: region.code,
          name: region.name,
        },
      });
      console.log(`  Created: ${region.code} - ${region.name}`);
    } else {
      console.log(`  Already exists: ${region.code} - ${region.name}`);
    }
  }
}

async function seedAdminUser() {
  console.log("\nSeeding admin user...");

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: adminUser.email }, { rut: adminUser.rut }],
    },
  });

  if (existing) {
    console.log(`  Already exists: ${existing.email} (id: ${existing.id}, role: ${existing.role})`);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminUser.password, 10);

  const created = await prisma.user.create({
    data: {
      email: adminUser.email,
      password: hashedPassword,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      rut: adminUser.rut,
      phone: adminUser.phone,
      role: adminUser.role,
    },
  });

  console.log(`  Created: ${created.email} (id: ${created.id}, role: ${created.role})`);
}

async function main() {
  await seedCategories();
  await seedRegions();
  await seedAdminUser();
  console.log("\nDone!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
