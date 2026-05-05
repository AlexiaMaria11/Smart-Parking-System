import { devices } from "../../mockData";
import { PageHeader } from "../../components/layout/PageHeader";
import { DeviceCard } from "../../components/hardware/DeviceCard";
import "./AdminPages.css";

export function AdminHardwarePage() {
  return (
    <div>
      <PageHeader
        title="Hardware"
        description="Sensors, barriers and cameras are organized with health, uptime and maintenance actions."
      />
      <div className="admin-hardware-grid">
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </div>
  );
}
