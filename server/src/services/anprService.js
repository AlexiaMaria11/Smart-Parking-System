import { prisma } from "../config/db.js";
import { publishCommand } from "./mqttService.js";
import { getFormattedSpot } from "../utils/spotFormatter.js";

const OVERSTAY_BUFFER_MINUTES = 15;
const EARLY_ENTRY_BUFFER_MINUTES = 15;

async function emitSpotUpdate(io, spotId) {
  if (!io) return;
  const spot = await getFormattedSpot(spotId);
  if (spot) io.emit("parking:spot:updated", spot);
}

export const anprService = {
  async detectEntry(plate, io) {
    const now = new Date();

    // ── Caz 1: vehicul cunoscut cu rezervare validă ───────────────────────
    const vehicle = await prisma.vehicle.findUnique({
      where: { licensePlate: plate },
    });

    if (vehicle) {
      const reservation = await prisma.reservation.findFirst({
        where: {
          vehicleId: vehicle.id,
          status: "UPCOMING",
          startTime: {
            lte: new Date(
              now.getTime() + EARLY_ENTRY_BUFFER_MINUTES * 60 * 1000,
            ),
          },
          endTime: { gte: now },
        },
        include: { parkingSpot: true },
      });

      if (reservation) {
        const targetSpot = reservation.parkingSpot;

        // Locul rezervat e liber → intrare normală
        if (targetSpot.isAvailable) {
          publishCommand("bariera_intrare", "OPEN");

          await Promise.all([
            prisma.reservation.update({
              where: { id: reservation.id },
              data: { status: "ACTIVE" },
            }),
            prisma.parkingSpot.update({
              where: { id: targetSpot.id },
              data: { isAvailable: false },
            }),
            prisma.parkingEvent.create({
              data: {
                type: "ENTRY",
                entryType: "RESERVATION",
                description: `${plate} entered with reservation — spot ${targetSpot.code}`,
                licensePlate: plate,
                parkingSpotId: targetSpot.id,
              },
            }),
          ]);

          await emitSpotUpdate(io, targetSpot.id);
          return { allowed: true, type: "RESERVATION", spot: targetSpot.code };
        }

        // Locul rezervat e ocupat → verifică overstay
        const activeReservationOnSpot = await prisma.reservation.findFirst({
          where: { parkingSpotId: targetSpot.id, status: "ACTIVE" },
        });

        const isOverstay =
          activeReservationOnSpot &&
          new Date(activeReservationOnSpot.endTime).getTime() +
            OVERSTAY_BUFFER_MINUTES * 60 * 1000 <
            now.getTime();

        // Caută loc de conflict
        const conflictSpot = await prisma.parkingSpot.findFirst({
          where: { spotType: "CONFLICT", isAvailable: true },
          orderBy: { code: "asc" },
        });

        if (conflictSpot) {
          publishCommand("bariera_intrare", "OPEN");

          await Promise.all([
            prisma.parkingSpot.update({
              where: { id: conflictSpot.id },
              data: { isAvailable: false },
            }),
            prisma.parkingEvent.create({
              data: {
                type: "CONFLICT",
                entryType: "CONFLICT",
                description: `${plate} redirected to ${conflictSpot.code} — spot ${targetSpot.code} occupied${isOverstay ? " (overstay)" : ""}`,
                licensePlate: plate,
                parkingSpotId: conflictSpot.id,
              },
            }),
          ]);

          await emitSpotUpdate(io, conflictSpot.id);
          return {
            allowed: true,
            type: "CONFLICT",
            spot: conflictSpot.code,
            originalSpot: targetSpot.code,
            reason: isOverstay ? "overstay" : "occupied",
          };
        }

        // Niciun loc de conflict
        publishCommand("bariera_intrare", "DENY");
        await prisma.parkingEvent.create({
          data: {
            type: "DENIED",
            description: `${plate} — spot ${targetSpot.code} occupied, no conflict spot available`,
            licensePlate: plate,
            parkingSpotId: targetSpot.id,
          },
        });
        return { allowed: false, reason: "conflict_no_space" };
      }
    }

    // ── Caz 2: walk-in — caută primul loc WALK_IN disponibil ─────────────
    const freeWalkInSpot = await prisma.parkingSpot.findFirst({
      where: { spotType: "WALK_IN", isAvailable: true },
      orderBy: { code: "asc" },
    });

    if (!freeWalkInSpot) {
      publishCommand("bariera_intrare", "DENY");
      await prisma.parkingEvent.create({
        data: {
          type: "DENIED",
          description: `${plate} — no walk-in spot available`,
          licensePlate: plate,
        },
      });
      return { allowed: false, reason: "no_walkin_space" };
    }

    publishCommand("bariera_intrare", "OPEN");

    // Dacă placa e înregistrată → creează rezervare walk-in + plată pendintă
    if (vehicle) {
      const maxEndTime = new Date(now.getTime() + 24 * 3600000);
      const walkInReservation = await prisma.reservation.create({
        data: {
          userId: vehicle.ownerId,
          vehicleId: vehicle.id,
          parkingSpotId: freeWalkInSpot.id,
          status: "ACTIVE",
          startTime: now,
          endTime: maxEndTime,
          totalCost: 0,
        },
      });
      await prisma.payment.create({
        data: {
          reservationId: walkInReservation.id,
          userId: vehicle.ownerId,
          amount: 0,
          status: "PENDING",
        },
      });
    }

    await Promise.all([
      prisma.parkingSpot.update({
        where: { id: freeWalkInSpot.id },
        data: { isAvailable: false },
      }),
      prisma.parkingEvent.create({
        data: {
          type: "ENTRY",
          entryType: "WALK_IN",
          description: `${plate} entered as walk-in — spot ${freeWalkInSpot.code}`,
          licensePlate: plate,
          parkingSpotId: freeWalkInSpot.id,
        },
      }),
    ]);

    await emitSpotUpdate(io, freeWalkInSpot.id);
    return { allowed: true, type: "WALK_IN", spot: freeWalkInSpot.code };
  },
};
