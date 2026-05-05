import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const testClient = await prisma.user.upsert({
    where: { email: "test@parking.com" },
    update: {},
    create: {
      name: "Test Client",
      email: "test@parking.com",
      passwordHash: "test1234",
      role: "CLIENT",
    },
  });
  console.log("Seeded user:", testClient.email);

  for (let i = 1; i <= 10; i++) {
    const code = `P${i}`;
    await prisma.parkingSpot.upsert({
      where: { code },
      update: {},
      create: {
        code,
        isAvailable: true,
        pricePerHour: 5.00,
      },
    });
  }
  console.log("Seeded parking spots: P1-P10");

  const barriers = [
    { name: "bariera_intrare", location: "Intrare principala" },
    { name: "bariera_iesire", location: "Iesire principala" },
  ];

  for (const barrier of barriers) {
    await prisma.hardwareDevice.upsert({
      where: { name: barrier.name },
      update: {},
      create: {
        name: barrier.name,
        type: "BARRIER",
        status: "ONLINE",
        location: barrier.location,
      },
    });
  }
  console.log("Seeded barriers: bariera_intrare, bariera_iesire");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
