import { useState, useCallback } from "react";
import { useApi } from "../../hooks/useApi";
import { apiRequest } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { VehicleCard } from "../../components/vehicles/VehicleCard";
import { Button } from "../../components/common/Button";
import "./ClientPages.css";

export function ClientVehiclesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const { data, loading } = useApi(`/vehicles?_=${refreshKey}`);
  const vehicles = (data ?? []).map((v) => ({
    id: v.id,
    label: v.label,
    plate: v.licensePlate,
    isDefault: v.isDefault,
  }));

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ label: "", plate: "" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);

  async function handleAddVehicle() {
    if (!addForm.label.trim() || !addForm.plate.trim()) {
      setAddError("Please fill in all fields.");
      return;
    }
    setAddLoading(true);
    setAddError(null);
    try {
      await apiRequest("/vehicles", {
        method: "POST",
        body: JSON.stringify({ label: addForm.label, licensePlate: addForm.plate }),
      });
      setAddForm({ label: "", plate: "" });
      setShowAdd(false);
      refresh();
    } catch {
      setAddError("Failed to add vehicle. Check the licence plate format.");
    } finally {
      setAddLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="My Vehicles"
        description="Save your vehicles, set a default, and keep licence plates handy for reservations."
        action={
          <Button onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? "Cancel" : "Add Vehicle"}
          </Button>
        }
      />

      {showAdd && (
        <div className="client-add-vehicle-form">
          <input
            className="entity-card-input"
            placeholder="Label (e.g. My Car)"
            value={addForm.label}
            onChange={(e) => setAddForm((f) => ({ ...f, label: e.target.value }))}
          />
          <input
            className="entity-card-input"
            placeholder="Licence plate (e.g. B-11-XXX)"
            value={addForm.plate}
            onChange={(e) => setAddForm((f) => ({ ...f, plate: e.target.value }))}
          />
          {addError && <p className="entity-card-error">{addError}</p>}
          <Button onClick={handleAddVehicle} disabled={addLoading}>
            {addLoading ? "Adding..." : "Confirm"}
          </Button>
        </div>
      )}

      {loading ? (
        <p className="client-empty-copy">Loading vehicles...</p>
      ) : vehicles.length === 0 ? (
        <p className="client-empty-copy">No vehicles saved yet.</p>
      ) : (
        <div className="client-vehicle-list">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onUpdated={refresh}
              onDeleted={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
