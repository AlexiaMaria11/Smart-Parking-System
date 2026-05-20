import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Button } from "../common/Button";
import "./Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function prettifyMode(mode) {
  return mode
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

export function ChartPanel({
  series,
  labels = {},
  titles = {},
  buttonLabels = {},
  formatters = {},
  eyebrow = "Insights",
  defaultMode,
}) {
  const modes = Object.keys(series);
  const [mode, setMode] = useState(defaultMode || modes[0]);
  const values = series[mode];
  const chartLabels =
    labels[mode] || values.map((_, index) => `${8 + index}:00`);
  const formatValue = formatters[mode] || ((value) => value);

  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: titles[mode] || prettifyMode(mode),
        data: values,
        backgroundColor: "rgba(189, 57, 82, 0.75)",
        borderColor: "#BD3952",
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600, easing: "easeInOutQuart" },
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: mode === "occupancy" ? 100 : undefined,
        grid: { color: "rgba(189, 57, 82, 0.06)" },
        ticks: { callback: (value) => formatValue(value) },
      },
      x: {
        grid: { display: false },
        ticks: { maxRotation: 0 },
      },
    },
  };

  return (
    <div className="chart-panel">
      <div className="panel-header-spread">
        <div>
          <p className="panel-eyebrow">{eyebrow}</p>
          <h3 className="panel-title">{titles[mode] || prettifyMode(mode)}</h3>
        </div>
        <div className="chart-actions">
          {modes.map((item) => (
            <Button
              key={item}
              variant={mode === item ? "primary" : "secondary"}
              onClick={() => setMode(item)}
            >
              {buttonLabels[item] || prettifyMode(item)}
            </Button>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          className="chart-container"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Bar data={data} options={options} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
