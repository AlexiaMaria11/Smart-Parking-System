import { prisma } from "../config/db.js";

export const reportsRepository = {
  async getOverview() {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalSpots,
      occupiedSpots,
      completedReservations,
      dailyRevenue,
      monthlyRevenue,
      noShows,
      cancellations,
      conflicts
    ] = await Promise.all([
      prisma.parkingSpot.count(),
      prisma.parkingSpot.count({ where: { isAvailable: false } }),

      prisma.reservation.findMany({
        where: { status: "COMPLETED" },
        select: { startTime: true, endTime: true }
      }),

      prisma.payment.aggregate({
        where: { status: "PAID", createdAt: { gte: startOfDay } },
        _sum: { amount: true }
      }),

      prisma.payment.aggregate({
        where: { status: "PAID", createdAt: { gte: startOfMonth } },
        _sum: { amount: true }
      }),

      prisma.reservation.count({ where: { status: "NO_SHOW" } }),
      prisma.reservation.count({ where: { status: "CANCELLED" } }),
      prisma.parkingEvent.count({ where: { type: "CONFLICT" } })
    ]);

    const occupancyPercent =
      totalSpots > 0 ? Math.round((occupiedSpots / totalSpots) * 100) : 0;

    let durationAverageMinutes = 0;
    if (completedReservations.length > 0) {
      const totalMinutes = completedReservations.reduce((sum, r) => {
        return sum + (new Date(r.endTime) - new Date(r.startTime)) / 60000;
      }, 0);
      durationAverageMinutes = Math.round(totalMinutes / completedReservations.length);
    }

    return {
      occupancy: {
        current: occupancyPercent,
        totalSpots,
        occupiedSpots
      },
      durationAverageMinutes,
      revenue: {
        daily: Number(dailyRevenue._sum.amount ?? 0),
        monthly: Number(monthlyRevenue._sum.amount ?? 0)
      },
      issues: {
        noShows,
        cancellations,
        conflicts
      }
    };
  }
};
