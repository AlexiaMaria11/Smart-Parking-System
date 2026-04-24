import { useState } from "react";
import { parkingSpots } from "../../mockData";
import { PageHeader } from "../../components/layout/PageHeader";
import { ParkingGrid } from "../../components/parking/ParkingGrid";
import { SpotDetailsCard } from "../../components/parking/SpotDetailsCard";

export function AdminLiveMapPage() {
  const [selectedSpot, setSelectedSpot] = useState(parkingSpots[0]);

  return (
    <div>
      <PageHeader
        title="Live Map"
        description="Inspect occupancy, user details and spot status in real time. Designed for Socket.IO spot events."
      />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ParkingGrid spots={parkingSpots} selectedSpot={selectedSpot} onSelect={setSelectedSpot} />
        <SpotDetailsCard spot={selectedSpot} adminMode />
      </div>
    </div>
  );
}
