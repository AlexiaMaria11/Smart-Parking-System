import "../cards/Cards.css";

export function ReportCard({ report }) {
  return (
    <div className="report-card">
      <p className="report-card-title">{report.title}</p>
      <p className="report-card-value">{report.value}</p>
      <p className="report-card-description">{report.description}</p>
    </div>
  );
}
