import { Button } from "../common/Button";
import "../cards/Cards.css";

export function ReservationCard({ reservation }) {
  return (
    <div className="entity-card">
      <div className="entity-card-content-wide">
        <div>
          <p className="entity-card-eyebrow">{reservation.status}</p>
          <h3 className="entity-card-title">{reservation.spot}</h3>
          <div className="entity-card-details">
            <p>Date: {reservation.date}</p>
            <p>Time: {reservation.interval}</p>
            <p>Vehicle: {reservation.vehicle}</p>
            <p>Cost: {reservation.cost}</p>
          </div>
        </div>
        <div className="entity-card-actions">
          <Button variant="secondary">View Details</Button>
          <Button variant="secondary">Extend</Button>
          <Button variant="secondary">Rebook</Button>
          <Button>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
