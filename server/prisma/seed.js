const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@college.edu" },
    update: { emailVerified: true },
    create: {
      name: "Super Admin",
      email: "admin@college.edu",
      passwordHash,
      role: "SUPER_ADMIN",
      emailVerified: true,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@college.edu" },
    update: { emailVerified: true },
    create: {
      name: "Test Student",
      email: "student@college.edu",
      passwordHash,
      role: "STUDENT",
      emailVerified: true,
    },
  });

  const tag = await prisma.tag.upsert({
    where: { name: "react" },
    update: {},
    create: { name: "react" },
  });

  await prisma.question.create({
    data: {
      title: "Why does useEffect run twice in development?",
      body: "I'm seeing my useEffect fire twice when the app loads in dev mode. Is this a bug?",
      userId: student.id,
      tags: { create: [{ tag: { connect: { id: tag.id } } }] },
    },
  });

  console.log("Seed complete. Login with admin@college.edu / password123 or student@college.edu / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
