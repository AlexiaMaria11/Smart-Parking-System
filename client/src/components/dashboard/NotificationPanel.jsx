import { motion } from "framer-motion";
import "./Dashboard.css";

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 240, damping: 22 } },
};

export function NotificationPanel({ notifications }) {
  return (
    <div className="notification-panel">
      <p className="panel-eyebrow">Important notifications</p>
      <motion.div
        className="notification-list"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {notifications.map((item) => (
          <motion.div
            key={item.title}
            className="notification-item"
            variants={itemVariants}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="notification-dot" />
            <div>
              <h4 className="notification-title">{item.title}</h4>
              <p className="notification-description">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
