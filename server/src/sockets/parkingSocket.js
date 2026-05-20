import { prisma } from "../config/db.js";

export function registerParkingSocket(io) {
  io.on("connection", async (socket) => {
    try {
      const spots = await prisma.parkingSpot.findMany({
        orderBy: { code: "asc" },
        select: { id: true, code: true, isAvailable: true, pricePerHour: true },
      });

      const availableSpots = spots.filter((s) => s.isAvailable).length;

      socket.emit("parking:bootstrap", {
        spots,
        availableSpots,
        occupiedSpots: spots.length - availableSpots,
      });
    } catch (err) {
      console.error("[Socket] bootstrap error:", err.message);
    }

    socket.on("parking:spot:update", (payload) => {
      io.emit("parking:spot:updated", payload);
    });
  });
}
