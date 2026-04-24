import { Button } from "../common/Button";

export function VehicleCard({ vehicle }) {
  return (
    <div className="glass-panel p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{vehicle.isDefault ? "Default vehicle" : "Saved vehicle"}</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">{vehicle.label}</h3>
          <p className="mt-2 text-muted">{vehicle.plate}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary">Edit</Button>
          <Button variant="secondary">Delete</Button>
          <Button>{vehicle.isDefault ? "Default" : "Set Default"}</Button>
        </div>
      </div>
    </div>
  );
}
