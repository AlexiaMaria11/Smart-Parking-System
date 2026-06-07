import { useApi } from "../../hooks/useApi";
import { PageHeader } from "../../components/layout/PageHeader";
import { ReportCard } from "../../components/reports/ReportCard";
import "./AdminPages.css";

function formatDuration(minutes) {
  if (!minutes) return "0 min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}min` : `${m} min`;
}

function buildReports(data) {
  if (!data) return [];
  return [
    {
      title: "Current occupancy",
      value: `${data.occupancy.current}%`,
      description: `${data.occupancy.occupiedSpots} of ${data.occupancy.totalSpots} spots occupied right now`,
    },
    {
      title: "Avg. parking duration",
      value: formatDuration(data.durationAverageMinutes),
      description: "Average calculated from all completed reservations",
    },
    {
      title: "Today's revenue",
      value: `${data.revenue.daily.toFixed(2)} RON`,
      description: "Total payments processed today",
    },
    {
      title: "Monthly revenue",
      value: `${data.revenue.monthly.toFixed(2)} RON`,
      description: "Total payments processed this month",
    },
    {
      title: "No-shows",
      value: String(data.issues.noShows),
      description: "Reservations where the user did not arrive",
    },
    {
      title: "Cancellations",
      value: String(data.issues.cancellations),
      description: "Total reservations cancelled by users",
    },
    {
      title: "Conflicts",
      value: String(data.issues.conflicts),
      description: "Cases where a reserved spot was already occupied",
    },
  ];
}

export function AdminReportsPage() {
  const { data, loading } = useApi("/reports");
  const reports = buildReports(data);

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Occupancy, duration, revenue and incidents — real-time data from the database."
      />
      {loading ? (
        <p style={{ padding: "1rem", opacity: 0.6 }}>Loading reports...</p>
      ) : (
        <div className="admin-reports-grid">
          {reports.map((report) => (
            <ReportCard key={report.title} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
