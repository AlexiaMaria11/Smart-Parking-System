import { motion } from "framer-motion";
import { cn } from "../../utils/formatters";
import "./Parking.css";

const stateClasses = {
  available: "parking-spot-available",
  occupied: "parking-spot-occupied",
  reserved: "parking-spot-reserved",
  defective: "parking-spot-defective"
};

export function ParkingGrid({ spots, selectedSpot, onSelect, isInteractive = true }) {
  return (
    <div className={cn("parking-grid", !isInteractive && "parking-grid-preview")}>
      <div className="parking-grid-list">
        {spots.map((spot, index) => {
          const SpotElement = isInteractive ? motion.button : motion.div;

          return (
            <SpotElement
              key={spot.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={isInteractive ? (event) => onSelect?.(spot, event) : undefined}
              className={cn(
                "group parking-spot",
                selectedSpot?.id === spot.id
                  ? "parking-spot-selected parking-spot-active"
                  : stateClasses[spot.state]
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
            </SpotElement>
          );
        })}
      </div>
    </div>
  );
}
