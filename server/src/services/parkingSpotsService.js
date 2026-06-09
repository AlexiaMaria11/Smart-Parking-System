import { prisma } from "../config/db.js";
import { parkingSpotsRepository } from "../repositories/parkingSpotsRepository.js";
import { getFormattedSpot } from "../utils/spotFormatter.js";

export const parkingSpotsService = {
  async getParkingSpots() {
    return parkingSpotsRepository.findAll();
  },

  async release(id, io) {
    const spot = await prisma.parkingSpot.findUnique({
      where: { id },
      select: { code: true },
    });
    if (!spot) throw new Error("Spot not found");

    await parkingSpotsRepository.release(id);

    await prisma.parkingEvent.create({
      data: {
        type: "EXIT",
        description: `Spot ${spot.code} force-released by admin`,
        parkingSpotId: id,
      },
    });

    const updated = await getFormattedSpot(id);
    io?.emit("parking:spot:updated", updated);
    return updated;
  },

  async setDefective(id, io) {
    const spot = await prisma.parkingSpot.findUnique({
      where: { id },
      select: { code: true },
    });
    if (!spot) throw new Error("Spot not found");

    await parkingSpotsRepository.setDefective(id);

    await prisma.parkingEvent.create({
      data: {
        type: "DENIED",
        description: `Spot ${spot.code} marked as unavailable by admin`,
        parkingSpotId: id,
      },
    });

    const updated = await getFormattedSpot(id);
    io?.emit("parking:spot:updated", updated);
    return updated;
  },
};
