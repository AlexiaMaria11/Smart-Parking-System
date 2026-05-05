import {
  adminChartLabels,
  adminChartSeries,
  adminChartTitles,
  adminStats,
  recentActivities,
} from "../../mockData";
import { StatCard } from "../../components/common/StatCard";
import { ChartPanel } from "../../components/dashboard/ChartPanel";
import { ActivityFeed } from "../../components/dashboard/ActivityFeed";
import { PageHeader } from "../../components/layout/PageHeader";
import "./AdminPages.css";

export function AdminDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Track occupancy, revenue and important parking activity from a central operational view."
      />
      <div className="admin-stats-grid">
        {adminStats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>
      <div className="admin-dashboard-grid">
        <ChartPanel
          series={adminChartSeries}
          labels={adminChartLabels}
          titles={adminChartTitles}
          buttonLabels={{ occupancy: "Occupancy", revenue: "Revenue" }}
          formatters={{
            occupancy: (value) => `${value}%`,
            revenue: (value) => `${value} RON`,
          }}
        />
        <ActivityFeed items={recentActivities} />
      </div>
    </div>
  );
}
