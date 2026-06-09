import {
  PrismaClient,
  Role,
  EntryType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Cleanup ───────────────────────────────────────────────────────────────
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.parkingEvent.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.parkingSpot.deleteMany();
  await prisma.user.deleteMany();

  // ─── Passwords ─────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("admin123", 10);
  const clientHash = await bcrypt.hash("client123", 10);
  const defaultHash = await bcrypt.hash("password123", 10);

  // ─── Users ─────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@parking.com",
      phone: "+40700000000",
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  const clientDemo = await prisma.user.create({
    data: {
      name: "Client Demo",
      email: "client@parking.com",
      phone: "+40733333333",
      passwordHash: clientHash,
      role: Role.CLIENT,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: "Ion Popescu",
      email: "ion@example.com",
      phone: "+40711111111",
      passwordHash: defaultHash,
      role: Role.CLIENT,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Maria Ionescu",
      email: "maria@example.com",
      phone: "+40722222222",
      passwordHash: defaultHash,
      role: Role.CLIENT,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: "Alex Muresan",
      email: "alex@example.com",
      phone: "+40744444444",
      passwordHash: defaultHash,
      role: Role.CLIENT,
    },
  });

  const user4 = await prisma.user.create({
    data: {
      name: "Ana Constantin",
      email: "ana@example.com",
      phone: "+40755555555",
      passwordHash: defaultHash,
      role: Role.CLIENT,
    },
  });

  const user5 = await prisma.user.create({
    data: {
      name: "Radu Popa",
      email: "radu@example.com",
      phone: "+40766666666",
      passwordHash: defaultHash,
      role: Role.CLIENT,
    },
  });

  // ─── Vehicles ──────────────────────────────────────────────────────────────
  await prisma.vehicle.create({
    data: { label: "Ford Focus", licensePlate: "B-11-CLI", isDefault: true, ownerId: clientDemo.id },
  });

  await prisma.vehicle.createMany({
    data: [
      { label: "Dacia Logan",      licensePlate: "TM-01-ABC", isDefault: true,  ownerId: user1.id },
      { label: "Volkswagen Golf",  licensePlate: "TM-02-XYZ", isDefault: false, ownerId: user1.id },
      { label: "Renault Clio",     licensePlate: "B-99-MAR",  isDefault: true,  ownerId: user2.id },
      { label: "Skoda Octavia",    licensePlate: "CJ-10-ALX", isDefault: true,  ownerId: user3.id },
      { label: "Toyota Yaris",     licensePlate: "IS-05-ANA", isDefault: true,  ownerId: user4.id },
      { label: "BMW 320d",         licensePlate: "TM-77-RAD", isDefault: true,  ownerId: user5.id },
    ],
  });

  // ─── Parking Spots ─────────────────────────────────────────────────────────
  // A1–A3: rezervare obligatorie
  // B1–B3: walk-in
  // C1–C2: conflict buffer
  await prisma.parkingSpot.createMany({
    data: [
      { code: "A1", spotType: EntryType.RESERVATION, isAvailable: true, pricePerHour: 5.0 },
      { code: "A2", spotType: EntryType.RESERVATION, isAvailable: true, pricePerHour: 5.0 },
      { code: "A3", spotType: EntryType.RESERVATION, isAvailable: true, pricePerHour: 5.0 },
      { code: "B1", spotType: EntryType.WALK_IN,     isAvailable: true, pricePerHour: 4.0 },
      { code: "B2", spotType: EntryType.WALK_IN,     isAvailable: true, pricePerHour: 4.0 },
      { code: "B3", spotType: EntryType.WALK_IN,     isAvailable: true, pricePerHour: 4.0 },
      { code: "C1", spotType: EntryType.CONFLICT,    isAvailable: true, pricePerHour: 3.0 },
      { code: "C2", spotType: EntryType.CONFLICT,    isAvailable: true, pricePerHour: 3.0 },
    ],
  });

  console.log("✅ Seed complet!");
  console.log("   👤 admin@parking.com   / admin123");
  console.log("   👤 client@parking.com  / client123");
  console.log("   👤 ion@example.com     / password123");
  console.log("   👤 maria@example.com   / password123");
  console.log("   👤 alex@example.com    / password123");
  console.log("   👤 ana@example.com     / password123");
  console.log("   👤 radu@example.com    / password123");
  console.log("   🅿️  Spoturi: 8 | toate disponibile");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
