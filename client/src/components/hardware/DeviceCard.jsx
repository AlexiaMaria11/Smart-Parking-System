import { Button } from "../common/Button";

export function DeviceCard({ device }) {
  return (
    <div className="glass-panel p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{device.type}</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">{device.name}</h3>
          <div className="mt-4 space-y-2 text-sm text-muted">
            <p>Status: {device.status}</p>
            <p>Uptime: {device.uptime}</p>
          </div>
          <div className="mt-5">
            <p className="text-sm font-semibold text-ink">Error history</p>
            <ul className="mt-2 space-y-2 text-sm text-muted">
              {device.errors.map((error) => (
                <li key={error}>• {error}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button>Restart Device</Button>
          <Button variant="secondary">Calibrate Sensor</Button>
        </div>
      </div>
    </div>
  );
}
