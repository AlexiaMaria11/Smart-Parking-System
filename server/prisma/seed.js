import {
  PrismaClient,
  Role,
  ReservationStatus,
  PaymentStatus,
  HardwareType,
  HardwareStatus,
  ParkingEventType,
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

  // ─── Password ──────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 10);

  // ─── Admin ─────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@parking.com",
      phone: "+40700000000",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // ─── Clients ───────────────────────────────────────────────────────────────
  const user1 = await prisma.user.create({
    data: {
      name: "Ion Popescu",
      email: "ion@example.com",
      phone: "+40711111111",
      passwordHash,
      role: Role.CLIENT,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Maria Ionescu",
      email: "maria@example.com",
      phone: "+40722222222",
      passwordHash,
      role: Role.CLIENT,
    },
  });

  // ─── Vehicles ──────────────────────────────────────────────────────────────
  const vehicle1 = await prisma.vehicle.create({
    data: {
      label: "Dacia Logan",
      licensePlate: "TM-01-ABC",
      isDefault: true,
      ownerId: user1.id,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      label: "Volkswagen Golf",
      licensePlate: "TM-02-XYZ",
      isDefault: false,
      ownerId: user1.id,
    },
  });

  const vehicle3 = await prisma.vehicle.create({
    data: {
      label: "Renault Clio",
      licensePlate: "B-99-MAR",
      isDefault: true,
      ownerId: user2.id,
    },
  });

  // ─── Parking Spots ─────────────────────────────────────────────────────────
  const spotsData = [
    { code: "A1", isAvailable: false, pricePerHour: 5.0 },
    { code: "A2", isAvailable: true, pricePerHour: 5.0 },
    { code: "A3", isAvailable: true, pricePerHour: 4.0 },
    { code: "A4", isAvailable: false, pricePerHour: 4.0 },
    { code: "B5", isAvailable: false, pricePerHour: 4.0 },
    { code: "B6", isAvailable: true, pricePerHour: 5.0 },
    { code: "B7", isAvailable: false, pricePerHour: 5.0 },
    { code: "B8", isAvailable: true, pricePerHour: 6.0 },
  ];

  const spots = await Promise.all(
    spotsData.map((spot) => prisma.parkingSpot.create({ data: spot })),
  );

  // ─── Reservations ──────────────────────────────────────────────────────────
  const now = new Date();

  const reservation1 = await prisma.reservation.create({
    data: {
      userId: user1.id,
      vehicleId: vehicle1.id,
      parkingSpotId: spots[0].id, // A1
      status: ReservationStatus.ACTIVE,
      startTime: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1h ago
      endTime: new Date(now.getTime() + 1 * 60 * 60 * 1000), // 1h from now
      totalCost: 10.0,
    },
  });

  const reservation2 = await prisma.reservation.create({
    data: {
      userId: user1.id,
      vehicleId: vehicle2.id,
      parkingSpotId: spots[3].id, // A4
      status: ReservationStatus.UPCOMING,
      startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2h from now
      endTime: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4h from now
      totalCost: 8.0,
    },
  });

  const reservation3 = await prisma.reservation.create({
    data: {
      userId: user2.id,
      vehicleId: vehicle3.id,
      parkingSpotId: spots[6].id, // B7
      status: ReservationStatus.ACTIVE,
      startTime: new Date(now.getTime() - 30 * 60 * 1000), // 30min ago
      endTime: new Date(now.getTime() + 90 * 60 * 1000), // 1.5h from now
      totalCost: 12.5,
    },
  });

  const reservation4 = await prisma.reservation.create({
    data: {
      userId: user2.id,
      vehicleId: vehicle3.id,
      parkingSpotId: spots[4].id, // B5
      status: ReservationStatus.COMPLETED,
      startTime: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      totalCost: 8.0,
    },
  });

  // ─── Payments ──────────────────────────────────────────────────────────────
  await prisma.payment.createMany({
    data: [
      {
        reservationId: reservation1.id,
        userId: user1.id,
        amount: 10.0,
        status: PaymentStatus.PAID,
      },
      {
        reservationId: reservation2.id,
        userId: user1.id,
        amount: 8.0,
        status: PaymentStatus.PENDING,
      },
      {
        reservationId: reservation3.id,
        userId: user2.id,
        amount: 12.5,
        status: PaymentStatus.PAID,
      },
      {
        reservationId: reservation4.id,
        userId: user2.id,
        amount: 8.0,
        status: PaymentStatus.PAID,
      },
    ],
  });

  // ─── Parking Events ────────────────────────────────────────────────────────
  await prisma.parkingEvent.createMany({
    data: [
      {
        type: ParkingEventType.ENTRY,
        entryType: EntryType.RESERVATION,
        description: "Vehicul intrat pe baza rezervării",
        licensePlate: "TM-01-ABC",
        parkingSpotId: spots[0].id,
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      },
      {
        type: ParkingEventType.RESERVATION_CREATED,
        description: "Rezervare nouă creată pentru A4",
        licensePlate: "TM-02-XYZ",
        parkingSpotId: spots[3].id,
        createdAt: new Date(now.getTime() - 20 * 60 * 1000),
      },
      {
        type: ParkingEventType.ENTRY,
        entryType: EntryType.RESERVATION,
        description: "Vehicul intrat pe baza rezervării",
        licensePlate: "B-99-MAR",
        parkingSpotId: spots[6].id,
        createdAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
      {
        type: ParkingEventType.EXIT,
        description: "Vehicul ieșit după rezervare completată",
        licensePlate: "B-99-MAR",
        parkingSpotId: spots[4].id,
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      },
      {
        type: ParkingEventType.WALK_IN,
        entryType: EntryType.WALK_IN,
        description: "Parcare plina — acces refuzat",
        licensePlate: "CJ-10-ZZZ",
        createdAt: new Date(now.getTime() - 45 * 60 * 1000),
        type: ParkingEventType.DENIED,
      },
    ],
  });

  // ─── Notifications ─────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        title: "Rezervare confirmată",
        message: "Rezervarea ta pentru locul A1 a fost confirmată.",
        userId: user1.id,
        isRead: true,
      },
      {
        title: "Rezervare upcoming",
        message: "Ai o rezervare pentru locul A4 în 2 ore.",
        userId: user1.id,
        isRead: false,
      },
      {
        title: "Plată procesată",
        message: "Plata de 12.50 RON pentru locul B7 a fost procesată.",
        userId: user2.id,
        isRead: false,
      },
      {
        title: "Rezervare finalizată",
        message: "Rezervarea ta pentru locul B5 a fost finalizată. Mulțumim!",
        userId: user2.id,
        isRead: true,
      },
    ],
  });

  console.log("✅ Seed complet!");
  console.log(`   👤 Admin:   admin@parking.com`);
  console.log(`   👤 User 1:  ion@example.com`);
  console.log(`   👤 User 2:  maria@example.com`);
  console.log(`   🔑 Parolă:  password123`);
  console.log(`   🅿️  Locuri:  8 (A1-A4, B5-B8)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
