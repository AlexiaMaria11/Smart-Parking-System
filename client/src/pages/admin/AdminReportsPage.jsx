import { reports } from "../../mockData";
import { PageHeader } from "../../components/layout/PageHeader";
import { ReportCard } from "../../components/reports/ReportCard";
import "./AdminPages.css";

export function AdminReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Review occupancy, duration, financial performance and issue trends across the parking system."
      />
      <div className="admin-reports-grid">
        {reports.map((report) => (
          <ReportCard key={report.title} report={report} />
        ))}
      </div>
    </div>
  );
}
