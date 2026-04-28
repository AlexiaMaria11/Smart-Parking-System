import { motion } from "framer-motion";
import { cn } from "../../utils/formatters";
import "./Parking.css";

const stateClasses = {
  available: "parking-spot-available",
  occupied: "parking-spot-occupied",
  reserved: "parking-spot-reserved",
  selected: "parking-spot-selected",
  defective: "parking-spot-defective"
};

export function ParkingGrid({ spots, selectedSpot, onSelect }) {
  return (
    <div className="parking-grid">
      <div className="parking-grid-list">
        {spots.map((spot, index) => (
          <motion.button
            key={spot.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            onClick={() => onSelect?.(spot)}
            className={cn(
              "group parking-spot",
              stateClasses[spot.state],
              selectedSpot?.id === spot.id ? "parking-spot-active" : ""
            )}
          >
            <div className="parking-spot-top">
              <span className="parking-spot-id">{spot.id}</span>
              <span className="parking-spot-state">{spot.state}</span>
            </div>
            <div className="parking-spot-body">
              <p className="parking-spot-number">{spot.number}</p>
              <p className="parking-spot-price">{spot.price}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
