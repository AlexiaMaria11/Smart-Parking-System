import { useState } from "react";
import { parkingSpots } from "../../mockData";
import { PageHeader } from "../../components/layout/PageHeader";
import { ParkingGrid } from "../../components/parking/ParkingGrid";
import { SpotDetailsCard } from "../../components/parking/SpotDetailsCard";
import { LiveRoutePreview } from "../../components/parking/LiveRoutePreview";

export function ClientParkingPage() {
  const [selectedSpot, setSelectedSpot] = useState(parkingSpots[10]);

  return (
    <div>
      <PageHeader
        title="Parking Spots"
        description="Explore the map, inspect pricing and restrictions, then reserve the best parking spot for your schedule."
      />
      <div className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <ParkingGrid spots={parkingSpots} selectedSpot={selectedSpot} onSelect={setSelectedSpot} />
          <LiveRoutePreview />
        </div>
        <SpotDetailsCard spot={selectedSpot} />
      </div>
    </div>
  );
}
