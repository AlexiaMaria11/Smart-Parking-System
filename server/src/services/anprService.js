import { prisma } from "../config/db.js";
import { publishCommand } from "./mqttService.js";

export const anprService = {
  async detectEntry(plate) {
    const now = new Date();

    // Case 1 — known vehicle with a valid upcoming reservation (allow 15 min early)
    const vehicle = await prisma.vehicle.findUnique({
      where: { licensePlate: plate },
    });

    if (vehicle) {
      const reservation = await prisma.reservation.findFirst({
        where: {
          vehicleId: vehicle.id,
          status: "UPCOMING",
          startTime: { lte: new Date(now.getTime() + 15 * 60 * 1000) },
          endTime: { gte: now },
        },
        include: { parkingSpot: true },
      });

      if (reservation) {
        publishCommand("bariera_intrare", "OPEN");

        await Promise.all([
          prisma.reservation.update({
            where: { id: reservation.id },
            data: { status: "ACTIVE" },
          }),
          prisma.parkingEvent.create({
            data: {
              type: "ENTRY",
              entryType: "RESERVATION",
              description: `${plate} a intrat cu rezervare — loc ${reservation.parkingSpot.code}`,
              licensePlate: plate,
              parkingSpotId: reservation.parkingSpotId,
            },
          }),
        ]);

        return { allowed: true, type: "RESERVATION", spot: reservation.parkingSpot.code };
      }
    }

    // Case 2 — walk-in: assign first available spot
    const freeSpot = await prisma.parkingSpot.findFirst({
      where: { isAvailable: true },
      orderBy: { code: "asc" },
    });

    if (!freeSpot) {
      await prisma.parkingEvent.create({
        data: {
          type: "DENIED",
          description: `${plate} — parcare plina, intrare refuzata`,
          licensePlate: plate,
        },
      });
      return { allowed: false, reason: "full" };
    }

    publishCommand("bariera_intrare", "OPEN");

    await prisma.parkingEvent.create({
      data: {
        type: "ENTRY",
        entryType: "WALK_IN",
        description: `${plate} a intrat fara rezervare — loc ${freeSpot.code}`,
        licensePlate: plate,
        parkingSpotId: freeSpot.id,
      },
    });

    return { allowed: true, type: "WALK_IN", spot: freeSpot.code };
  },
};
