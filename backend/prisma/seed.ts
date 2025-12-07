import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create skills first
  const skills = [
    "Frontend",
    "Backend",
    "Database",
    "DevOps",
    "UI/UX",
    "Testing",
    "Mobile",
    "AI/ML",
  ];

  await prisma.skill.createMany({
    data: skills.map((name) => ({ name })),
    skipDuplicates: true,
  });

  // Get created skills
  const frontendSkill = await prisma.skill.findUnique({
    where: { name: "Frontend" },
  });
  const backendSkill = await prisma.skill.findUnique({
    where: { name: "Backend" },
  });
  const databaseSkill = await prisma.skill.findUnique({
    where: { name: "Database" },
  });
  const uiuxSkill = await prisma.skill.findUnique({ where: { name: "UI/UX" } });

  // Create developers with skills
  const alice = await prisma.developer.create({
    data: {
      name: "Alice",
      email: "alice@gmail.com",
      skills: {
        create: [{ skillId: frontendSkill!.id }, { skillId: uiuxSkill!.id }],
      },
    },
  });

  const bob = await prisma.developer.create({
    data: {
      name: "Bob",
      email: "bob@gmail.com",
      skills: {
        create: [{ skillId: backendSkill!.id }, { skillId: databaseSkill!.id }],
      },
    },
  });

  const carol = await prisma.developer.create({
    data: {
      name: "Carol",
      email: "carol@gmail.com",
      skills: {
        create: [{ skillId: frontendSkill!.id }, { skillId: backendSkill!.id }],
      },
    },
  });

  const dave = await prisma.developer.create({
    data: {
      name: "Dave",
      email: "dave@gmail.com",
      skills: {
        create: [{ skillId: backendSkill!.id }],
      },
    },
  });

  console.log("Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
