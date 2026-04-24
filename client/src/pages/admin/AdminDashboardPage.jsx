import { adminChartSeries, adminStats, recentActivities } from "../../mockData";
import { StatCard } from "../../components/common/StatCard";
import { ChartPanel } from "../../components/dashboard/ChartPanel";
import { ActivityFeed } from "../../components/dashboard/ActivityFeed";
import { PageHeader } from "../../components/layout/PageHeader";

export function AdminDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Track occupancy, revenue and important parking activity from a central operational view."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartPanel series={adminChartSeries} />
        <ActivityFeed items={recentActivities} />
      </div>
    </div>
  );
}
