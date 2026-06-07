import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import "./Common.css";

export function StatCard({ label, value, trend, icon: Icon, delay = 0 }) {
  const isPositive = trend?.startsWith("+");
  const isNegative = trend?.startsWith("-");

  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -6,
        boxShadow: "0 28px 52px rgba(189, 57, 82, 0.2), 0 8px 16px rgba(189, 57, 82, 0.1)",
      }}
      style={{ boxShadow: "0 0px 0px rgba(189, 57, 82, 0), 0 0px 0px rgba(189, 57, 82, 0)" }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay }}
    >
      <div className="stat-card-accent" />
      <div className="stat-card-content">
        <div>
          <p className="stat-card-label">{label}</p>
          <p className="stat-card-value">{value}</p>
          {trend && (
            <div className={`stat-card-trend-row${isPositive ? " stat-trend-up" : isNegative ? " stat-trend-down" : ""}`}>
              {isPositive && <TrendingUp size={11} />}
              {isNegative && <TrendingDown size={11} />}
              <p className="stat-card-trend">{trend}</p>
            </div>
          )}
        </div>
        {Icon ? (
          <motion.div
            className="stat-card-icon"
            whileHover={{ scale: 1.15, rotate: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Icon size={18} />
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
}
