import { motion } from "framer-motion";
import {
  adminChartLabels,
  adminChartSeries,
  adminChartTitles,
  adminStats,
  recentActivities,
} from "../../constants/mock.data";
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

export function AdminDashboardPage() {
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
        {adminStats.map((item, i) => (
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
      </motion.div>
    </motion.div>
  );
}
