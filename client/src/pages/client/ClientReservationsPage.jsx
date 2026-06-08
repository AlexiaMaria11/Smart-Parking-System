import { useState, useCallback } from "react";
import { useApi } from "../../hooks/useApi";
import { PageHeader } from "../../components/layout/PageHeader";
import { ReservationCard } from "../../components/reservations/ReservationCard";
import "./ClientPages.css";

const STATUS_TO_SECTION = {
  ACTIVE: "active",
  UPCOMING: "upcoming",
  COMPLETED: "past",
  CANCELLED: "cancelled",
  NO_SHOW: "past",
};

function formatReservation(r) {
  const fmt = (iso) =>
    new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return {
    id: r.id,
    spot: r.parkingSpot?.code ?? "—",
    date: new Date(r.startTime).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    }),
    interval: `${fmt(r.startTime)} - ${fmt(r.endTime)}`,
    vehicle: r.vehicle?.label ?? "—",
    cost: `${Number(r.totalCost).toFixed(2)} RON`,
    status: r.status,
    section: STATUS_TO_SECTION[r.status] ?? "past",
  };
}

export function ClientReservationsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const { data, loading } = useApi(`/reservations?_=${refreshKey}`);
  const reservations = (data ?? []).map(formatReservation);
  const sections = ["active", "upcoming", "past", "cancelled"];

  return (
    <div>
      <PageHeader
        title="My Reservations"
        description="Active, upcoming, past and cancelled reservations."
      />
      {loading ? (
        <p className="client-empty-copy">Loading reservations...</p>
      ) : (
        <div className="client-reservations">
          {sections.map((section) => {
            const items = reservations.filter((r) => r.section === section);
            if (items.length === 0) return null;
            return (
              <section key={section} className="client-reservation-section">
                <h2 className="client-reservation-heading">{section}</h2>
                <div className="client-reservation-list">
                  {items.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      showStatus={false}
                      onUpdated={refresh}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
