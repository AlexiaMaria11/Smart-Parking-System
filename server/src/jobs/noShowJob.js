import { prisma } from "../config/db.js";

const CHECK_INTERVAL_MS = 60 * 1000;

async function markNoShows() {
  const expired = await prisma.reservation.findMany({
    where: { status: "UPCOMING", endTime: { lt: new Date() } },
    select: { id: true, userId: true, parkingSpot: { select: { id: true, code: true } } },
  });

  if (expired.length === 0) return;

  await Promise.all(
    expired.map((r) =>
      Promise.all([
        prisma.reservation.update({
          where: { id: r.id },
          data: { status: "NO_SHOW" },
        }),
        prisma.parkingEvent.create({
          data: {
            type: "NO_SHOW",
            description: `Reservation expired without entry — spot ${r.parkingSpot.code}`,
            parkingSpotId: r.parkingSpot.id,
          },
        }),
        prisma.notification.create({
          data: {
            userId: r.userId,
            title: "Reservation marked as No-Show",
            message: `Your reservation for spot ${r.parkingSpot.code} expired without entry.`,
          },
        }),
      ])
    )
  );

  console.log(`[NO_SHOW] Marked ${expired.length} reservation(s) as NO_SHOW`);
}

export function startNoShowJob() {
  markNoShows();
  setInterval(markNoShows, CHECK_INTERVAL_MS);
}
