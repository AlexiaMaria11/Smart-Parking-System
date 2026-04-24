import { reports } from "../../mockData";
import { PageHeader } from "../../components/layout/PageHeader";
import { ReportCard } from "../../components/reports/ReportCard";

export function AdminReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Review occupancy, duration, financial performance and issue trends across the parking system."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <ReportCard key={report.title} report={report} />
        ))}
      </div>
    </div>
  );
}
