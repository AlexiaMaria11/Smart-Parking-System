import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../common/Button";
import "./Dashboard.css";

export function ChartPanel({ series }) {
  const [mode, setMode] = useState("revenue");
  const values = series[mode];
  const max = Math.max(...values);

  return (
    <div className="chart-panel">
      <div className="panel-header-spread">
        <div>
          <p className="panel-eyebrow">Insights</p>
          <h3 className="panel-title">
            {mode === "revenue" ? "Revenue over time" : "Parking occupancy by hour"}
          </h3>
        </div>
        <div className="chart-actions">
          <Button variant={mode === "revenue" ? "primary" : "secondary"} onClick={() => setMode("revenue")}>
            Revenue
          </Button>
          <Button variant={mode === "occupancy" ? "primary" : "secondary"} onClick={() => setMode("occupancy")}>
            Occupancy
          </Button>
        </div>
      </div>
      <div className="chart-bars">
        {values.map((value, index) => (
          <div key={`${mode}-${index}`} className="chart-column">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(value / max) * 100}%` }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              className="chart-bar"
            />
            <span className="chart-label">{`${8 + index}:00`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
