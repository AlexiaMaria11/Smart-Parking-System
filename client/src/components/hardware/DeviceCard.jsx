import { Button } from "../common/Button";
import "../cards/Cards.css";

export function DeviceCard({ device }) {
  return (
    <div className="entity-card">
      <div className="entity-card-content-wide">
        <div>
          <p className="entity-card-eyebrow">{device.type}</p>
          <h3 className="entity-card-title">{device.name}</h3>
          <div className="entity-card-details">
            <p>Status: {device.status}</p>
            <p>Uptime: {device.uptime}</p>
          </div>
          <div className="entity-card-subsection">
            <p className="entity-card-subtitle">Error history</p>
            <ul className="entity-card-list">
              {device.errors.map((error) => (
                <li key={error}>• {error}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="entity-card-actions">
          <Button>Restart Device</Button>
          <Button variant="secondary">Calibrate Sensor</Button>
        </div>
      </div>
    </div>
  );
}
