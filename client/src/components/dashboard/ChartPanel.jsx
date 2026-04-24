import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../common/Button";

export function ChartPanel({ series }) {
  const [mode, setMode] = useState("revenue");
  const values = series[mode];
  const max = Math.max(...values);

  return (
    <div className="glass-panel p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Insights</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">
            {mode === "revenue" ? "Revenue over time" : "Parking occupancy by hour"}
          </h3>
        </div>
        <div className="flex gap-2">
          <Button variant={mode === "revenue" ? "primary" : "secondary"} onClick={() => setMode("revenue")}>
            Revenue
          </Button>
          <Button variant={mode === "occupancy" ? "primary" : "secondary"} onClick={() => setMode("occupancy")}>
            Occupancy
          </Button>
        </div>
      </div>
      <div className="flex h-72 items-end gap-4 rounded-[24px] bg-gradient-to-b from-white to-blush/60 p-6">
        {values.map((value, index) => (
          <div key={`${mode}-${index}`} className="flex flex-1 flex-col items-center gap-3">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(value / max) * 100}%` }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              className="w-full rounded-t-[20px] bg-gradient-to-t from-primary to-secondary"
            />
            <span className="text-xs font-semibold text-muted">{`${8 + index}:00`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
