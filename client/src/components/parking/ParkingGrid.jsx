import { motion } from "framer-motion";
import { cn } from "../../utils/formatters";
import "./Parking.css";

const stateClasses = {
  available: "parking-spot-available",
  occupied: "parking-spot-occupied",
  reserved: "parking-spot-reserved",
  conflict: "parking-spot-conflict",
  defective: "parking-spot-defective",
};

const spotTypeLabels = {
  RESERVATION: "reservation",
  WALK_IN: "walk-in",
  CONFLICT: "conflict",
};

// Row 1: A1 A2 A3 C1 — Row 2: B1 B2 B3 C2
const DISPLAY_ORDER = ["A1", "A2", "A3", "C1", "B1", "B2", "B3", "C2"];

function orderSpots(spots) {
  const byCode = Object.fromEntries(spots.map((s) => [s.code, s]));
  const ordered = DISPLAY_ORDER.map((code) => byCode[code]).filter(Boolean);
  const rest = spots.filter((s) => !DISPLAY_ORDER.includes(s.code));
  return [...ordered, ...rest];
}

export function ParkingGrid({
  spots,
  selectedSpot,
  onSelect,
  isInteractive = true,
}) {
  const orderedSpots = orderSpots(spots);

  return (
    <div
      className={cn("parking-grid", !isInteractive && "parking-grid-preview")}
    >
      <div className="parking-grid-list">
        {orderedSpots.map((spot, index) => {
          const SpotElement = isInteractive ? motion.button : motion.div;

          return (
            <SpotElement
              key={spot.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={
                isInteractive ? (event) => onSelect?.(spot, event) : undefined
              }
              className={cn(
                "group parking-spot",
                selectedSpot?.id === spot.id
                  ? "parking-spot-selected parking-spot-active"
                  : stateClasses[spot.state],
              )}
            >
              <div className="parking-spot-top">
                <span className="parking-spot-id">{spot.code || spot.id}</span>
                <span className="parking-spot-state">{spot.state}</span>
              </div>
              <div className="parking-spot-body">
                <p className="parking-spot-code">{spot.code || spot.id}</p>
                <p className="parking-spot-price">{spot.price}</p>
                {spot.spotType && (
                  <span className="parking-spot-type-badge">
                    {spotTypeLabels[spot.spotType] ?? spot.spotType}
                  </span>
                )}
              </div>
            </SpotElement>
          );
        })}
      </div>
    </div>
  );
}
