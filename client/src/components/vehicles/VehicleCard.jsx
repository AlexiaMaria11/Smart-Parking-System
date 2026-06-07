import { useState } from "react";
import { Button } from "../common/Button";
import { apiRequest } from "../../services/api";
import "../cards/Cards.css";

export function VehicleCard({ vehicle, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ label: vehicle.label, plate: vehicle.plate });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      await apiRequest(`/vehicles/${vehicle.id}`, {
        method: "PUT",
        body: JSON.stringify({ label: form.label, licensePlate: form.plate }),
      });
      setEditing(false);
      onUpdated?.();
    } catch {
      setError("Failed to save changes.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete vehicle "${vehicle.label}" (${vehicle.plate})?`)) return;
    setLoading(true);
    try {
      await apiRequest(`/vehicles/${vehicle.id}`, { method: "DELETE" });
      onDeleted?.();
    } catch {
      setError("Failed to delete vehicle.");
      setLoading(false);
    }
  }

  async function handleSetDefault() {
    setLoading(true);
    try {
      await apiRequest(`/vehicles/${vehicle.id}/default`, { method: "PATCH" });
      onUpdated?.();
    } catch {
      setError("Failed to set default.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="entity-card">
      <div className="entity-card-content">
        <div>
          <p className="entity-card-eyebrow">
            {vehicle.isDefault ? "Default vehicle" : "Saved vehicle"}
          </p>
          {editing ? (
            <div className="entity-card-edit-form">
              <input
                className="entity-card-input"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Label"
              />
              <input
                className="entity-card-input"
                value={form.plate}
                onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value }))}
                placeholder="Licence plate"
              />
            </div>
          ) : (
            <>
              <h3 className="entity-card-title">{vehicle.label}</h3>
              <p className="entity-card-muted">{vehicle.plate}</p>
            </>
          )}
          {error && <p className="entity-card-error">{error}</p>}
        </div>
        <div className="entity-card-actions">
          {editing ? (
            <>
              <Button onClick={handleSave} disabled={loading}>Save</Button>
              <Button variant="secondary" onClick={() => setEditing(false)} disabled={loading}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setEditing(true)} disabled={loading}>
                Edit
              </Button>
              <Button variant="secondary" onClick={handleDelete} disabled={loading}>
                Delete
              </Button>
              <Button onClick={handleSetDefault} disabled={loading || vehicle.isDefault}>
                {vehicle.isDefault ? "Default" : "Set Default"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
