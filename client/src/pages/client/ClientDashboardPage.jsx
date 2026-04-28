import { clientStats, notifications, reservations } from "../../mockData";
import { PageHeader } from "../../components/layout/PageHeader";
import { StatCard } from "../../components/common/StatCard";
import { NotificationPanel } from "../../components/dashboard/NotificationPanel";
import { ReservationCard } from "../../components/reservations/ReservationCard";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import "./ClientPages.css";

export function ClientDashboardPage() {
  const { user } = useAuth();
  const activeReservation = reservations.find((item) => item.section === "active");

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name || "Client"}`}
        description="Manage your current reservation, vehicles and parking activity from one student-friendly dashboard."
        action={
          <div className="client-header-actions">
            <Button>Find Parking</Button>
            <Button variant="secondary">View Reservation</Button>
            <Button variant="secondary">Add Vehicle</Button>
          </div>
        }
      />
      <div className="client-stats-grid">
        {clientStats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>
      <div className="client-dashboard-grid">
        <div className="client-stack">
          <div className="client-status-panel">
            <p className="client-panel-eyebrow">Current reservation status</p>
            {activeReservation ? (
              <div className="client-reservation-wrap">
                <ReservationCard reservation={activeReservation} />
              </div>
            ) : (
              <p className="client-empty-copy">No active reservation right now.</p>
            )}
          </div>
        </div>
        <NotificationPanel notifications={notifications} />
      </div>
    </div>
  );
}
