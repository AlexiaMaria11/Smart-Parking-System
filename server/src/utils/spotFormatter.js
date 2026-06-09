import { prisma } from "../config/db.js";

function buildSelect(now) {
  const in15 = new Date(now.getTime() + 15 * 60 * 1000);
  return {
    id: true,
    code: true,
    spotType: true,
    isAvailable: true,
    pricePerHour: true,
    reservations: {
      where: {
        OR: [
          { status: "ACTIVE" },
          { status: "UPCOMING", startTime: { lte: in15 }, endTime: { gte: now } },
        ],
      },
      select: {
        status: true,
        endTime: true,
        vehicle: { select: { licensePlate: true } },
        user: { select: { name: true } },
      },
    },
    events: {
      where: { type: "ENTRY" },
      take: 1,
      orderBy: { createdAt: "desc" },
      select: { licensePlate: true, entryType: true },
    },
  };
}

function buildOccupiedBy(spot) {
  if (spot.isAvailable) return null;
  const res = spot.reservations.find((r) => r.status === "ACTIVE");
  const lastEntry = spot.events[0];
  if (res) {
    return {
      licensePlate: res.vehicle.licensePlate,
      userName: res.user.name,
      endTime: res.endTime,
      type: "RESERVATION",
    };
  }
  if (lastEntry) {
    return {
      licensePlate: lastEntry.licensePlate,
      userName: null,
      endTime: null,
      type: lastEntry.entryType,
    };
  }
  return null;
}

export function formatSpot(raw) {
  return {
    id: raw.id,
    code: raw.code,
    spotType: raw.spotType,
    isAvailable: raw.isAvailable,
    pricePerHour: Number(raw.pricePerHour),
    occupiedBy: buildOccupiedBy(raw),
    hasUpcoming: raw.reservations.some((r) => r.status === "UPCOMING"),
  };
}

export async function getAllFormattedSpots() {
  const now = new Date();
  const spots = await prisma.parkingSpot.findMany({
    orderBy: { code: "asc" },
    select: buildSelect(now),
  });
  return spots.map(formatSpot);
}

export async function getFormattedSpot(spotId) {
  const now = new Date();
  const s = await prisma.parkingSpot.findUnique({
    where: { id: spotId },
    select: buildSelect(now),
  });
  return s ? formatSpot(s) : null;
}
