import { motion } from "framer-motion";
import "./Parking.css";

export function LiveRoutePreview() {
  return (
    <div className="route-preview">
      <div className="route-preview-header">
        <p className="route-preview-eyebrow">Animated idea</p>
        <h3 className="route-preview-title">Car route to selected parking spot</h3>
      </div>
      <div className="route-preview-map">
        <div className="route-preview-track" />
        <motion.div
          animate={{ x: [0, 260, 440], y: [0, 82, 132] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="route-preview-car"
        />
        <div className="route-preview-target">
          Target spot: C-11
        </div>
      </div>
    </div>
  );
}
