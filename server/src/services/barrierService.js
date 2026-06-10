import { prisma } from "../config/db.js";
import { publishCommand, publishDisplayUpdate } from "./mqttService.js";

export async function broadcastDisplayState() {
  const [freeSpots, cheapest] = await Promise.all([
    prisma.parkingSpot.count({ where: { isAvailable: true } }),
    prisma.parkingSpot.findFirst({ orderBy: { pricePerHour: "asc" } }),
  ]);
  publishDisplayUpdate({
    freeSpots,
    pricePerHour: cheapest ? Number(cheapest.pricePerHour) : 0,
  });
}

export async function handleBarrierTrigger({ barrierId, payload, io }) {
  const { plate = "UNKNOWN" } = payload;
  const isEntry = barrierId === "bariera_intrare";

  publishCommand(barrierId, "OPEN");

  if (isEntry) {
    const spot = await prisma.parkingSpot.findFirst({
      where: { spotType: "WALK_IN", isAvailable: true },
      orderBy: { code: "asc" },
    });

    if (spot) {
      await prisma.parkingSpot.update({
        where: { id: spot.id },
        data: { isAvailable: false },
      });

      await prisma.parkingEvent.create({
        data: {
          type: "ENTRY",
          description: `Vehicle ${plate} entered and occupied spot ${spot.code}`,
          licensePlate: plate,
          parkingSpotId: spot.id,
        },
      });

      io.emit("parking:spot:updated", { code: spot.code, isAvailable: false });
      await broadcastDisplayState();
      console.log(`[ENTRY] ${plate} -> loc ${spot.code}`);
    } else {
      publishCommand(barrierId, "DENY");
      await broadcastDisplayState();
      console.log(`[ENTRY] ${plate} -> parcare plina, bariera blocata`);
    }
  } else {
    // Verifică plata înainte de ieșire
    const vehicleRecord = await prisma.vehicle.findFirst({
      where: { licensePlate: plate },
    });

    if (vehicleRecord) {
      const pendingPayment = await prisma.payment.findFirst({
        where: {
          userId: vehicleRecord.ownerId,
          status: "PENDING",
          reservation: { status: "ACTIVE" },
        },
      });

      if (pendingPayment) {
        publishCommand(barrierId, "DENY");
        await prisma.notification.create({
          data: {
            userId: vehicleRecord.ownerId,
            title: "Payment required to exit",
            message: "Please complete payment in the app (Dashboard → Pay) before leaving the parking.",
          },
        });
        console.log(`[EXIT DENIED] ${plate} -> pending payment`);
        return;
      }
    }

    const event = await prisma.parkingEvent.findFirst({
      where: { licensePlate: plate, type: "ENTRY" },
      orderBy: { createdAt: "desc" },
    });

    if (event?.parkingSpotId) {
      // Marchează rezervarea activă ca COMPLETED
      await prisma.reservation.updateMany({
        where: { parkingSpotId: event.parkingSpotId, status: "ACTIVE" },
        data: { status: "COMPLETED", endTime: new Date() },
      });

      const freedSpot = await prisma.parkingSpot.update({
        where: { id: event.parkingSpotId },
        data: { isAvailable: true },
      });

      await prisma.parkingEvent.create({
        data: {
          type: "EXIT",
          description: `Vehicle ${plate} vacated the spot`,
          licensePlate: plate,
          parkingSpotId: event.parkingSpotId,
        },
      });

      io.emit("parking:spot:updated", {
        code: freedSpot.code,
        isAvailable: true,
      });
      await broadcastDisplayState();
      console.log(`[EXIT] ${plate} -> loc eliberat`);
    }
  }
}
