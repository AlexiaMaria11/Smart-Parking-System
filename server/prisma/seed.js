import {
  PrismaClient,
  Role,
  ReservationStatus,
  PaymentStatus,
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
  const vehicleDemo = await prisma.vehicle.create({
    data: { label: "Ford Focus", licensePlate: "B-11-CLI", isDefault: true, ownerId: clientDemo.id },
  });

  const vehicle1a = await prisma.vehicle.create({
    data: { label: "Dacia Logan", licensePlate: "TM-01-ABC", isDefault: true, ownerId: user1.id },
  });
  const vehicle1b = await prisma.vehicle.create({
    data: { label: "Volkswagen Golf", licensePlate: "TM-02-XYZ", isDefault: false, ownerId: user1.id },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: { label: "Renault Clio", licensePlate: "B-99-MAR", isDefault: true, ownerId: user2.id },
  });

  const vehicle3 = await prisma.vehicle.create({
    data: { label: "Skoda Octavia", licensePlate: "CJ-10-ALX", isDefault: true, ownerId: user3.id },
  });

  const vehicle4 = await prisma.vehicle.create({
    data: { label: "Toyota Yaris", licensePlate: "IS-05-ANA", isDefault: true, ownerId: user4.id },
  });

  const vehicle5 = await prisma.vehicle.create({
    data: { label: "BMW 320d", licensePlate: "TM-77-RAD", isDefault: true, ownerId: user5.id },
  });

  // ─── Parking Spots ─────────────────────────────────────────────────────────
  // A1–A3: rezervare obligatorie (cu bariere)
  // B1–B3: walk-in
  // C1–C2: conflict buffer
  const spotsData = [
    { code: "A1", spotType: EntryType.RESERVATION, isAvailable: false, pricePerHour: 5.0 },
    { code: "A2", spotType: EntryType.RESERVATION, isAvailable: false, pricePerHour: 5.0 },
    { code: "A3", spotType: EntryType.RESERVATION, isAvailable: true,  pricePerHour: 5.0 },
    { code: "B1", spotType: EntryType.WALK_IN,     isAvailable: false, pricePerHour: 4.0 },
    { code: "B2", spotType: EntryType.WALK_IN,     isAvailable: true,  pricePerHour: 4.0 },
    { code: "B3", spotType: EntryType.WALK_IN,     isAvailable: true,  pricePerHour: 4.0 },
    { code: "C1", spotType: EntryType.CONFLICT,    isAvailable: true,  pricePerHour: 3.0 },
    { code: "C2", spotType: EntryType.CONFLICT,    isAvailable: true,  pricePerHour: 3.0 },
  ];

  const spots = await Promise.all(
    spotsData.map((spot) => prisma.parkingSpot.create({ data: spot }))
  );
  // spots[0]=A1, [1]=A2, [2]=A3, [3]=B1, [4]=B2, [5]=B3, [6]=C1, [7]=C2

  // ─── Reservations ──────────────────────────────────────────────────────────
  const now = new Date();

  // clientDemo — rezervare ACTIVE pe A1 (acum în desfășurare)
  const resDemo1 = await prisma.reservation.create({
    data: {
      userId: clientDemo.id,
      vehicleId: vehicleDemo.id,
      parkingSpotId: spots[0].id,
      status: ReservationStatus.ACTIVE,
      startTime: new Date(now.getTime() - 40 * 60 * 1000),
      endTime:   new Date(now.getTime() + 80 * 60 * 1000),
      totalCost: 10.0,
    },
  });

  // clientDemo — rezervare UPCOMING pe A3
  const resDemo2 = await prisma.reservation.create({
    data: {
      userId: clientDemo.id,
      vehicleId: vehicleDemo.id,
      parkingSpotId: spots[2].id,
      status: ReservationStatus.UPCOMING,
      startTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
      endTime:   new Date(now.getTime() + 5 * 60 * 60 * 1000),
      totalCost: 10.0,
    },
  });

  // clientDemo — rezervare COMPLETED (istorică)
  const resDemo3 = await prisma.reservation.create({
    data: {
      userId: clientDemo.id,
      vehicleId: vehicleDemo.id,
      parkingSpotId: spots[2].id,
      status: ReservationStatus.COMPLETED,
      startTime: new Date(now.getTime() - 10 * 60 * 60 * 1000),
      endTime:   new Date(now.getTime() -  8 * 60 * 60 * 1000),
      totalCost: 10.0,
    },
  });

  // clientDemo — rezervare CANCELLED
  const resDemo4 = await prisma.reservation.create({
    data: {
      userId: clientDemo.id,
      vehicleId: vehicleDemo.id,
      parkingSpotId: spots[2].id,
      status: ReservationStatus.CANCELLED,
      startTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      endTime:   new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      totalCost: 0,
    },
  });

  // user1 — rezervare ACTIVE pe A2 (acum în desfășurare)
  const res1 = await prisma.reservation.create({
    data: {
      userId: user1.id,
      vehicleId: vehicle1a.id,
      parkingSpotId: spots[1].id,
      status: ReservationStatus.ACTIVE,
      startTime: new Date(now.getTime() - 30 * 60 * 1000),
      endTime:   new Date(now.getTime() + 90 * 60 * 1000),
      totalCost: 10.0,
    },
  });

  // user1 — rezervare UPCOMING pe A3
  const res2 = await prisma.reservation.create({
    data: {
      userId: user1.id,
      vehicleId: vehicle1b.id,
      parkingSpotId: spots[2].id,
      status: ReservationStatus.UPCOMING,
      startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      endTime:   new Date(now.getTime() + 4 * 60 * 60 * 1000),
      totalCost: 10.0,
    },
  });

  // user1 — rezervare NO_SHOW (istorică)
  const res3 = await prisma.reservation.create({
    data: {
      userId: user1.id,
      vehicleId: vehicle1a.id,
      parkingSpotId: spots[2].id,
      status: ReservationStatus.NO_SHOW,
      startTime: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      endTime:   new Date(now.getTime() - 3 * 60 * 60 * 1000),
      totalCost: 10.0,
    },
  });

  // user2 — rezervare COMPLETED (istorică pe A1)
  const res4 = await prisma.reservation.create({
    data: {
      userId: user2.id,
      vehicleId: vehicle2.id,
      parkingSpotId: spots[0].id,
      status: ReservationStatus.COMPLETED,
      startTime: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      endTime:   new Date(now.getTime() - 4 * 60 * 60 * 1000),
      totalCost: 10.0,
    },
  });

  // user3 — rezervare UPCOMING pe A1 (vine după clientDemo — scenariul de conflict)
  const res5 = await prisma.reservation.create({
    data: {
      userId: user3.id,
      vehicleId: vehicle3.id,
      parkingSpotId: spots[0].id,
      status: ReservationStatus.UPCOMING,
      startTime: new Date(now.getTime() + 90 * 60 * 1000),
      endTime:   new Date(now.getTime() + 3 * 60 * 60 * 1000),
      totalCost: 10.0,
    },
  });

  // user4 — rezervare COMPLETED (istorică pe A2)
  const res6 = await prisma.reservation.create({
    data: {
      userId: user4.id,
      vehicleId: vehicle4.id,
      parkingSpotId: spots[1].id,
      status: ReservationStatus.COMPLETED,
      startTime: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      endTime:   new Date(now.getTime() - 6 * 60 * 60 * 1000),
      totalCost: 8.0,
    },
  });

  // user5 — rezervare CANCELLED
  const res7 = await prisma.reservation.create({
    data: {
      userId: user5.id,
      vehicleId: vehicle5.id,
      parkingSpotId: spots[2].id,
      status: ReservationStatus.CANCELLED,
      startTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      endTime:   new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      totalCost: 0,
    },
  });

  // ─── Walk-in activ pe B1 (fara rezervare) ─────────────────────────────────
  // (spot B1 e marcat isAvailable: false în seed, reflectă walk-in activ)

  // ─── Payments ──────────────────────────────────────────────────────────────
  await prisma.payment.createMany({
    data: [
      { reservationId: resDemo1.id, userId: clientDemo.id, amount: 10.0, status: PaymentStatus.PAID },
      { reservationId: resDemo2.id, userId: clientDemo.id, amount: 10.0, status: PaymentStatus.PENDING },
      { reservationId: resDemo3.id, userId: clientDemo.id, amount: 10.0, status: PaymentStatus.PAID },
      { reservationId: resDemo4.id, userId: clientDemo.id, amount: 0,    status: PaymentStatus.PAID },
      { reservationId: res1.id,     userId: user1.id,      amount: 10.0, status: PaymentStatus.PAID },
      { reservationId: res2.id,     userId: user1.id,      amount: 10.0, status: PaymentStatus.PENDING },
      { reservationId: res3.id,     userId: user1.id,      amount: 0,    status: PaymentStatus.PAID },
      { reservationId: res4.id,     userId: user2.id,      amount: 10.0, status: PaymentStatus.PAID },
      { reservationId: res5.id,     userId: user3.id,      amount: 10.0, status: PaymentStatus.PENDING },
      { reservationId: res6.id,     userId: user4.id,      amount: 8.0,  status: PaymentStatus.PAID },
      { reservationId: res7.id,     userId: user5.id,      amount: 0,    status: PaymentStatus.PAID },
    ],
  });

  // ─── Parking Events ────────────────────────────────────────────────────────
  await prisma.parkingEvent.createMany({
    data: [
      // Intrări active acum
      {
        type: ParkingEventType.ENTRY,
        entryType: EntryType.RESERVATION,
        description: "B-11-CLI entered with reservation — spot A1",
        licensePlate: "B-11-CLI",
        parkingSpotId: spots[0].id,
        createdAt: new Date(now.getTime() - 40 * 60 * 1000),
      },
      {
        type: ParkingEventType.ENTRY,
        entryType: EntryType.RESERVATION,
        description: "TM-01-ABC entered with reservation — spot A2",
        licensePlate: "TM-01-ABC",
        parkingSpotId: spots[1].id,
        createdAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
      {
        type: ParkingEventType.ENTRY,
        entryType: EntryType.WALK_IN,
        description: "IS-05-ANA entered as walk-in — spot B1",
        licensePlate: "IS-05-ANA",
        parkingSpotId: spots[3].id,
        createdAt: new Date(now.getTime() - 20 * 60 * 1000),
      },
      // Rezervări create
      {
        type: ParkingEventType.RESERVATION_CREATED,
        description: "New reservation created for A3 (user1 — TM-02-XYZ)",
        licensePlate: "TM-02-XYZ",
        parkingSpotId: spots[2].id,
        createdAt: new Date(now.getTime() - 25 * 60 * 1000),
      },
      {
        type: ParkingEventType.RESERVATION_CREATED,
        description: "New reservation created for A1 (user3 — CJ-10-ALX)",
        licensePlate: "CJ-10-ALX",
        parkingSpotId: spots[0].id,
        createdAt: new Date(now.getTime() - 10 * 60 * 1000),
      },
      {
        type: ParkingEventType.RESERVATION_CREATED,
        description: "New reservation created for A3 (clientDemo)",
        licensePlate: "B-11-CLI",
        parkingSpotId: spots[2].id,
        createdAt: new Date(now.getTime() - 15 * 60 * 1000),
      },
      // Ieșiri istorice
      {
        type: ParkingEventType.EXIT,
        description: "B-99-MAR vacated spot A1",
        licensePlate: "B-99-MAR",
        parkingSpotId: spots[0].id,
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      },
      {
        type: ParkingEventType.EXIT,
        description: "IS-05-ANA vacated spot A2",
        licensePlate: "IS-05-ANA",
        parkingSpotId: spots[1].id,
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
      {
        type: ParkingEventType.EXIT,
        description: "TM-77-RAD vacated spot A3",
        licensePlate: "TM-77-RAD",
        parkingSpotId: spots[2].id,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
      // No-show
      {
        type: ParkingEventType.NO_SHOW,
        description: "TM-01-ABC did not show up for reservation on A3",
        licensePlate: "TM-01-ABC",
        parkingSpotId: spots[2].id,
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      },
      // Denied
      {
        type: ParkingEventType.DENIED,
        description: "CJ-10-ZZZ — access denied, parking full",
        licensePlate: "CJ-10-ZZZ",
        createdAt: new Date(now.getTime() - 45 * 60 * 1000),
      },
      // Conflict — masina a stat peste rezervare, a doua masina a fost redirectionata
      {
        type: ParkingEventType.CONFLICT,
        description: "IS-55-XYZ overstayed reservation on A1 — redirected to C1",
        licensePlate: "IS-55-XYZ",
        parkingSpotId: spots[6].id,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      // Anulare rezervare
      {
        type: ParkingEventType.RESERVATION_CANCELLED,
        description: "Reservation cancelled for A3 (TM-77-RAD)",
        licensePlate: "TM-77-RAD",
        parkingSpotId: spots[2].id,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // ─── Notifications ─────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        title: "Reservation confirmed",
        message: "Your reservation for spot A1 is now active. Parking successful.",
        userId: clientDemo.id,
        isRead: true,
      },
      {
        title: "Upcoming reservation",
        message: "You have a reservation for spot A3 in 3 hours. Get ready!",
        userId: clientDemo.id,
        isRead: false,
      },
      {
        title: "Reservation cancelled",
        message: "Your reservation for spot A3 has been cancelled.",
        userId: clientDemo.id,
        isRead: true,
      },
      {
        title: "Reservation confirmed",
        message: "Your reservation for spot A2 is now active.",
        userId: user1.id,
        isRead: true,
      },
      {
        title: "Upcoming reservation",
        message: "You have a reservation for spot A3 in 2 hours.",
        userId: user1.id,
        isRead: false,
      },
      {
        title: "No-show recorded",
        message: "You did not show up for your reservation on A3. The cost has been charged.",
        userId: user1.id,
        isRead: false,
      },
      {
        title: "Payment processed",
        message: "Payment of 10.00 RON for spot A1 has been processed.",
        userId: user2.id,
        isRead: true,
      },
      {
        title: "Upcoming reservation",
        message: "You have a reservation for spot A1 in 1h 30m.",
        userId: user3.id,
        isRead: false,
      },
      {
        title: "Conflict situation",
        message: "Spot A1 was occupied on your arrival. You were redirected to spot C1.",
        userId: user3.id,
        isRead: false,
      },
      {
        title: "Payment processed",
        message: "Payment of 8.00 RON for spot A2 has been processed.",
        userId: user4.id,
        isRead: true,
      },
      {
        title: "Reservation cancelled",
        message: "Your reservation for A3 has been cancelled. No charge was applied.",
        userId: user5.id,
        isRead: true,
      },
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
  console.log("   🅿️  Spoturi: 8 | A1–A3 rezervare, B1–B3 walk-in, C1–C2 conflict");
  console.log("   📋 Rezervări: 11 | 💳 Plăți: 11 | 🔔 Notificări: 11 | 📝 Evenimente: 13");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
