import { reservations } from "../../mockData";
import { PageHeader } from "../../components/layout/PageHeader";
import { ReservationCard } from "../../components/reservations/ReservationCard";

export function ClientReservationsPage() {
  const sections = ["active", "upcoming", "past", "cancelled"];

  return (
    <div>
      <PageHeader
        title="My Reservations"
        description="Browse active, upcoming, past and cancelled reservations, with room for extend and rebook actions."
      />
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section}>
            <h2 className="mb-4 font-display text-2xl font-semibold capitalize">{section}</h2>
            <div className="space-y-4">
              {reservations
                .filter((item) => item.section === section)
                .map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
