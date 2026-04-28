import { vehicles } from "../../mockData";
import { PageHeader } from "../../components/layout/PageHeader";
import { VehicleCard } from "../../components/vehicles/VehicleCard";
import { Button } from "../../components/common/Button";
import "./ClientPages.css";

export function ClientVehiclesPage() {
  return (
    <div>
      <PageHeader
        title="My Vehicles"
        description="Save personal vehicles, choose the default one and keep plate numbers ready for reservations."
        action={<Button>Add Vehicle</Button>}
      />
      <div className="client-vehicle-list">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
}
