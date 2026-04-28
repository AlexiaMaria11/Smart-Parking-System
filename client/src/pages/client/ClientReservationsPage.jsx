import { reservations } from "../../mockData";
import { PageHeader } from "../../components/layout/PageHeader";
import { ReservationCard } from "../../components/reservations/ReservationCard";
import "./ClientPages.css";

export function ClientReservationsPage() {
  const sections = ["active", "upcoming", "past", "cancelled"];

  return (
    <div>
      <PageHeader
        title="My Reservations"
        description="Browse active, upcoming, past and cancelled reservations, with room for extend and rebook actions."
      />
      <div className="client-reservations">
        {sections.map((section) => (
          <section key={section}>
            <h2 className="client-reservation-heading">{section}</h2>
            <div className="client-reservation-list">
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
