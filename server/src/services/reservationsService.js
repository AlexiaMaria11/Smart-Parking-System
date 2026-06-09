import { prisma } from "../config/db.js";
import { reservationsRepository } from "../repositories/reservationsRepository.js";

async function findConflictingReservations(parkingSpotId, startTime, endTime) {
  return prisma.reservation.findMany({
    where: {
      parkingSpotId,
      status: { in: ["UPCOMING", "ACTIVE"] },
      AND: [
        { startTime: { lt: new Date(endTime) } },
        { endTime: { gt: new Date(startTime) } },
      ],
    },
  });
}

async function findFreeReservationSpot(excludeSpotId, startTime, endTime) {
  const allSpots = await prisma.parkingSpot.findMany({
    where: { spotType: "RESERVATION", id: { not: excludeSpotId } },
    orderBy: { code: "asc" },
  });

  for (const spot of allSpots) {
    const conflicts = await findConflictingReservations(spot.id, startTime, endTime);
    if (conflicts.length === 0) return spot;
  }
  return null;
}

export const reservationsService = {
  getReservations({ userId, role } = {}) {
    return reservationsRepository.findAll({ userId, role });
  },

  async create({ userId, vehicleId, parkingSpotId, startTime, endTime }) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) throw new Error("Ora de sfârșit trebuie să fie după ora de start.");

    let targetSpotId = parkingSpotId;
    let redirectedFrom = null;

    // Verifică conflict pe spotul ales
    const conflicts = await findConflictingReservations(parkingSpotId, start, end);
    if (conflicts.length > 0) {
      // Caută alt spot RESERVATION fără conflict în același interval
      const freeSpot = await findFreeReservationSpot(parkingSpotId, start, end);
      if (!freeSpot) {
        throw new Error(
          "Locul este deja rezervat în intervalul ales și nu există alte locuri disponibile. Alege un alt interval."
        );
      }
      redirectedFrom = parkingSpotId;
      targetSpotId = freeSpot.id;
    }

    const spot = await prisma.parkingSpot.findUnique({ where: { id: targetSpotId } });
    if (!spot) throw new Error("Spot not found");

    const hours = (end - start) / 3600000;
    const totalCost = Number(spot.pricePerHour) * hours;

    const reservation = await reservationsRepository.create({
      userId,
      vehicleId,
      parkingSpotId: targetSpotId,
      startTime: start,
      endTime: end,
      totalCost,
    });

    await prisma.payment.create({
      data: { reservationId: reservation.id, userId, amount: totalCost, status: "PENDING" },
    });

    await prisma.parkingEvent.create({
      data: {
        type: "RESERVATION_CREATED",
        description: redirectedFrom
          ? `Rezervare creată pentru ${spot.code} (redirectat de la loc cu conflict)`
          : `Rezervare creată pentru ${spot.code}`,
        parkingSpotId: targetSpotId,
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: redirectedFrom ? "Reservation created — spot changed" : "Reservation confirmed",
        message: redirectedFrom
          ? `The chosen spot was occupied in that interval. You were automatically redirected to spot ${spot.code}.`
          : `Reservation for spot ${spot.code} confirmed. Cost: ${totalCost.toFixed(2)} RON.`,
      },
    });

    return { ...reservation, redirectedFrom };
  },

  async cancel(id, userId, role) {
    const reservation = await reservationsRepository.findById(id);
    if (!reservation) throw new Error("Not found");
    if (role === "CLIENT" && reservation.userId !== userId) throw new Error("Forbidden");
    if (!["UPCOMING", "ACTIVE"].includes(reservation.status)) throw new Error("Cannot cancel");

    await prisma.parkingEvent.create({
      data: {
        type: "RESERVATION_CANCELLED",
        description: `Reservation cancelled for ${reservation.parkingSpot.code}`,
        parkingSpotId: reservation.parkingSpotId,
        licensePlate: reservation.vehicle.licensePlate,
      },
    });

    if (reservation.status === "ACTIVE") {
      await prisma.parkingSpot.update({
        where: { id: reservation.parkingSpotId },
        data: { isAvailable: true },
      });
    }

    await prisma.notification.create({
      data: {
        userId: reservation.userId,
        title: "Reservation cancelled",
        message: `Reservation for spot ${reservation.parkingSpot.code} has been cancelled.`,
      },
    });

    return reservationsRepository.cancel(id);
  },

  async extend(id, userId, role, extraHours = 1) {
    const reservation = await reservationsRepository.findById(id);
    if (!reservation) throw new Error("Not found");
    if (role === "CLIENT" && reservation.userId !== userId) throw new Error("Forbidden");
    if (!["UPCOMING", "ACTIVE"].includes(reservation.status)) throw new Error("Cannot extend");

    const newEndTime = new Date(new Date(reservation.endTime).getTime() + extraHours * 3600000);

    // Verifică că prelungirea nu creează conflict
    const conflicts = await findConflictingReservations(
      reservation.parkingSpotId,
      reservation.endTime,
      newEndTime
    );
    if (conflicts.length > 0) {
      throw new Error("Intervalul de prelungire se suprapune cu o altă rezervare pe același loc.");
    }

    const totalDurationHours = (newEndTime - new Date(reservation.startTime)) / 3600000;
    const newTotalCost = Number(reservation.parkingSpot.pricePerHour) * totalDurationHours;

    return reservationsRepository.extend(id, newEndTime, newTotalCost);
  },
};
