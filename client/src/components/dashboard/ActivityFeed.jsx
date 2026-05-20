import { motion } from "framer-motion";
import { InfoBadge } from "../common/InfoBadge";
import "./Dashboard.css";

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
};

export function ActivityFeed({ items }) {
  return (
    <div className="activity-panel">
      <div className="panel-header">
        <p className="panel-eyebrow">Recent activity</p>
        <h3 className="panel-title">Latest reservations, entries and incidents</h3>
      </div>
      <motion.div
        className="activity-list"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {items.map((item) => (
          <motion.div
            key={`${item.type}-${item.time}`}
            className="activity-item"
            variants={itemVariants}
            whileHover={{ x: 4, backgroundColor: "rgba(244, 164, 170, 0.08)" }}
            transition={{ duration: 0.2 }}
          >
            <div>
              <p className="activity-type">{item.type}</p>
              <p className="activity-title">{item.title}</p>
            </div>
            <div className="activity-meta">
              <InfoBadge tone={item.status}>{item.status}</InfoBadge>
              <p className="activity-time">{item.time}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
