import { clientStats, notifications, reservations } from "../../mockData";
import { PageHeader } from "../../components/layout/PageHeader";
import { StatCard } from "../../components/common/StatCard";
import { NotificationPanel } from "../../components/dashboard/NotificationPanel";
import { ReservationCard } from "../../components/reservations/ReservationCard";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";

export function ClientDashboardPage() {
  const { user } = useAuth();
  const activeReservation = reservations.find((item) => item.section === "active");

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name || "Client"}`}
        description="Manage your current reservation, vehicles and parking activity from one student-friendly dashboard."
        action={
          <div className="flex flex-wrap gap-3">
            <Button>Find Parking</Button>
            <Button variant="secondary">View Reservation</Button>
            <Button variant="secondary">Add Vehicle</Button>
          </div>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {clientStats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Current reservation status</p>
            {activeReservation ? (
              <div className="mt-4">
                <ReservationCard reservation={activeReservation} />
              </div>
            ) : (
              <p className="mt-4 text-muted">No active reservation right now.</p>
            )}
          </div>
        </div>
        <NotificationPanel notifications={notifications} />
      </div>
    </div>
  );
}
