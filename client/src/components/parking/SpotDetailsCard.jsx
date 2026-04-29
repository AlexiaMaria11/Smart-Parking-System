import { X } from "lucide-react";
import { Button } from "../common/Button";
import "./Parking.css";

export function SpotDetailsCard({ spot, adminMode = false, onClose }) {
  if (!spot) {
    return (
      <div className="spot-details">
        <p className="spot-details-empty-title">Select a parking spot</p>
        <p className="spot-details-empty-copy">Choose a spot from the map to inspect live details and actions.</p>
      </div>
    );
  }

  return (
    <div className="spot-details">
      <div className="spot-details-header">
        <div>
          <p className="spot-details-eyebrow">Spot overview</p>
          <h3 className="spot-details-title">{spot.id}</h3>
        </div>
        <div className="spot-details-header-actions">
          <span className="spot-details-status">{spot.state}</span>
          {onClose ? (
            <button
              type="button"
              className="spot-details-close"
              onClick={onClose}
              aria-label="Close spot overview"
            >
              <X size={18} />
            </button>
          ) : null}
        </div>
      </div>
      <div className="spot-details-list">
        <p><span className="spot-details-label">Price:</span> {spot.price}</p>
        <p><span className="spot-details-label">Availability:</span> {spot.state}</p>
        <p><span className="spot-details-label">Restrictions:</span> {spot.restrictions}</p>
        <p><span className="spot-details-label">User:</span> {spot.user || "No active user"}</p>
        <p><span className="spot-details-label">Remaining time:</span> {spot.remainingTime || "N/A"}</p>
        <p><span className="spot-details-label">License plate:</span> {spot.plate || "N/A"}</p>
      </div>
      <div className="spot-details-actions">
        {adminMode ? (
          <>
            <Button>Force Release</Button>
            <Button variant="secondary">Mark Defective</Button>
            <Button variant="secondary">Manual Reservation</Button>
          </>
        ) : (
          <>
            <Button>Reserve Spot</Button>
            <Button variant="secondary">Estimated cost: 10 RON</Button>
          </>
        )}
      </div>
    </div>
  );
}
