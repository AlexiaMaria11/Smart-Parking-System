import { Button } from "../common/Button";
import "../cards/Cards.css";

export function VehicleCard({ vehicle }) {
  return (
    <div className="entity-card">
      <div className="entity-card-content">
        <div>
          <p className="entity-card-eyebrow">{vehicle.isDefault ? "Default vehicle" : "Saved vehicle"}</p>
          <h3 className="entity-card-title">{vehicle.label}</h3>
          <p className="entity-card-muted">{vehicle.plate}</p>
        </div>
        <div className="entity-card-actions">
          <Button variant="secondary">Edit</Button>
          <Button variant="secondary">Delete</Button>
          <Button>{vehicle.isDefault ? "Default" : "Set Default"}</Button>
        </div>
      </div>
    </div>
  );
}
