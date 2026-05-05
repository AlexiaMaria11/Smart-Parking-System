import {
  clientChartLabels,
  clientChartSeries,
  clientChartTitles,
  clientStats,
  notifications,
  reservations,
} from "../../mockData";
import { PageHeader } from "../../components/layout/PageHeader";
import { StatCard } from "../../components/common/StatCard";
import { ChartPanel } from "../../components/dashboard/ChartPanel";
import { NotificationPanel } from "../../components/dashboard/NotificationPanel";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import "./ClientPages.css";

export function ClientDashboardPage() {
  const { user } = useAuth();
  const activeReservation = reservations.find(
    (item) => item.section === "active",
  );

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name || "Client"}`}
        description="Manage your current reservation, vehicles and parking activity from your dashboard."
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
              <div className="client-current-reservation">
                <div>
                  <p className="client-current-status">
                    {activeReservation.status}
                  </p>
                  <h3 className="client-current-spot">
                    {activeReservation.spot}
                  </h3>
                </div>
                <div className="client-current-details">
                  <p>
                    <span>Date:</span> {activeReservation.date}
                  </p>
                  <p>
                    <span>Time:</span> {activeReservation.interval}
                  </p>
                  <p>
                    <span>Vehicle:</span> {activeReservation.vehicle}
                  </p>
                  <p>
                    <span>Cost:</span> {activeReservation.cost}
                  </p>
                </div>
                <div className="client-current-actions">
                  <Button variant="secondary">View Details</Button>
                  <Button variant="secondary">Extend</Button>
                  <Button>Cancel</Button>
                </div>
              </div>
            ) : (
              <p className="client-empty-copy">
                No active reservation right now.
              </p>
            )}
          </div>
          <ChartPanel
            series={clientChartSeries}
            labels={clientChartLabels}
            titles={clientChartTitles}
            buttonLabels={{ parkingTime: "Time", spending: "Spending" }}
            formatters={{
              parkingTime: (value) => `${value} min`,
              spending: (value) => `${value} RON`,
            }}
            eyebrow="Personal activity"
          />
        </div>
        <NotificationPanel notifications={notifications} />
      </div>
    </div>
  );
}
