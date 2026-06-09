import { prisma } from "../config/db.js";
import { paymentsRepository } from "../repositories/paymentsRepository.js";

export const paymentsService = {
  getPayments({ userId, role } = {}) {
    return paymentsRepository.findAll({ userId, role });
  },

  async pay(id, userId) {
    const payment = await paymentsRepository.findById(id);
    if (!payment) throw new Error("Plata nu a fost găsită.");
    if (payment.userId !== userId) throw new Error("Acces interzis.");
    if (payment.status === "PAID") throw new Error("Plata a fost deja efectuată.");

    const reservation = payment.reservation;
    let finalAmount = Number(payment.amount);

    // amount=0 → calculează în funcție de timp parcat efectiv
    if (finalAmount === 0) {
      const startTime = reservation ? new Date(reservation.startTime) : new Date(payment.createdAt);
      const spot = reservation?.parkingSpot ?? payment.parkingSpot;
      const durationHours = (Date.now() - startTime.getTime()) / 3600000;
      const pricePerHour = Number(spot?.pricePerHour ?? 0);
      finalAmount = parseFloat((Math.ceil(durationHours * 10) / 10 * pricePerHour).toFixed(2));

      if (reservation) {
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { totalCost: finalAmount },
        });
      }
    }

    const updated = await paymentsRepository.pay(id, finalAmount);

    const spotCode = reservation?.parkingSpot?.code ?? payment.parkingSpot?.code ?? "spot";
    await prisma.notification.create({
      data: {
        userId,
        title: "Payment confirmed",
        message: `Payment of ${finalAmount.toFixed(2)} RON for spot ${spotCode} has been processed. You may now exit the parking.`,
      },
    });

    return updated;
  },
};
