import { useMemo } from "react";
import { motion } from "framer-motion";
import { CarFront, TimerReset, Bell, CircleDollarSign } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { StatCard } from "../../components/common/StatCard";
import { ChartPanel } from "../../components/dashboard/ChartPanel";
import { ActivityFeed } from "../../components/dashboard/ActivityFeed";
import { PageHeader } from "../../components/layout/PageHeader";
import "./AdminPages.css";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
};

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const panelVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 220, damping: 22 } },
};

const EVENT_STATUS = {
  ENTRY: "success",
  EXIT: "info",
  CONFLICT: "danger",
  DENIED: "danger",
  NO_SHOW: "warning",
  RESERVATION_CREATED: "info",
  RESERVATION_CANCELLED: "warning",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function buildStatCards(reports) {
  if (!reports) return [];
  return [
    {
      label: "Total spots",
      value: String(reports.occupancy.totalSpots),
      trend: "Parking spots in system",
      icon: CarFront,
    },
    {
      label: "Occupied spots",
      value: String(reports.occupancy.occupiedSpots),
      trend: "Updated live",
      icon: TimerReset,
    },
    {
      label: "Occupancy rate",
      value: `${reports.occupancy.current}%`,
      trend: `Avg. duration: ${reports.durationAverageMinutes} min`,
      icon: Bell,
    },
    {
      label: "Today revenue",
      value: `${reports.revenue.daily.toFixed(0)} RON`,
      trend: `Monthly: ${reports.revenue.monthly.toFixed(0)} RON`,
      icon: CircleDollarSign,
    },
  ];
}

function buildChartData(events) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const label = (d) => d.toLocaleDateString("en-GB", { weekday: "short" });

  const entryCounts = days.map((d) => {
    const dateStr = d.toDateString();
    return (events ?? []).filter(
      (e) => e.type === "ENTRY" && new Date(e.createdAt).toDateString() === dateStr
    ).length;
  });

  const eventCounts = days.map((d) => {
    const dateStr = d.toDateString();
    return (events ?? []).filter(
      (e) => new Date(e.createdAt).toDateString() === dateStr
    ).length;
  });

  return {
    series: { entries: entryCounts, activity: eventCounts },
    labels: { entries: days.map(label), activity: days.map(label) },
    titles: { entries: "Daily entries — last 7 days", activity: "All events — last 7 days" },
  };
}

function buildActivityItems(events) {
  if (!events) return [];
  return events.slice(0, 8).map((ev) => ({
    type: ev.type,
    title: ev.description,
    time: timeAgo(ev.createdAt),
    status: EVENT_STATUS[ev.type] ?? "info",
  }));
}

export function AdminDashboardPage() {
  const { data: reports } = useApi("/reports");
  const { data: events } = useApi("/parking-events");

  const statCards = buildStatCards(reports);
  const activityItems = buildActivityItems(events);
  const chartData = useMemo(() => buildChartData(events), [events]);

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible">
      <PageHeader
        title="Admin Dashboard"
        description="Track occupancy, revenue and important parking activity from a central operational view."
      />
      <motion.div
        className="admin-stats-grid"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
      >
        {statCards.map((item, i) => (
          <StatCard key={item.label} {...item} delay={i * 0.06} />
        ))}
      </motion.div>
      <motion.div
        className="admin-dashboard-grid"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.35 }}
      >
        <ChartPanel
          series={chartData.series}
          labels={chartData.labels}
          titles={chartData.titles}
          buttonLabels={{ entries: "Entries", activity: "Activity" }}
          formatters={{ entries: (v) => String(v), activity: (v) => String(v) }}
          eyebrow="Traffic insights"
        />
        <ActivityFeed items={activityItems} />
      </motion.div>
    </motion.div>
  );
}
