import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { parkingSpots } from "../../mockData";
import { PageHeader } from "../../components/layout/PageHeader";
import { ParkingGrid } from "../../components/parking/ParkingGrid";
import { SpotDetailsCard } from "../../components/parking/SpotDetailsCard";
import { LiveRoutePreview } from "../../components/parking/LiveRoutePreview";
import "./AdminPages.css";

export function AdminLiveMapPage() {
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [overviewPosition, setOverviewPosition] = useState({ x: 0, y: 0 });
  const closeSpotOverview = () => setIsOverviewOpen(false);
  const openSpotOverview = (spot, event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    setSelectedSpot(spot);
    setIsOverviewOpen(true);
    setOverviewPosition({
      x: rect.left + rect.width / 2 - 140,
      y: rect.top + rect.height / 2
    });
  };

  return (
    <div>
      <PageHeader
        title="Live Map"
        description="Inspect occupancy, user details and spot status in real time. Designed for Socket.IO spot events."
      />
      <div className="admin-live-map-grid">
        <div className="admin-stack">
          <ParkingGrid spots={parkingSpots} selectedSpot={selectedSpot} onSelect={openSpotOverview} />
          <LiveRoutePreview />
        </div>
      </div>
      <AnimatePresence onExitComplete={() => setSelectedSpot(null)}>
        {isOverviewOpen && selectedSpot ? (
          <motion.div
            key="spot-details-overlay"
            className="spot-details-overlay-root"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(2px)" }}
            exit={{
              opacity: 0,
              backdropFilter: "blur(0px)",
              transition: { delay: 0.18, duration: 0.22, ease: "easeOut" },
            }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <button
              type="button"
              className="spot-details-dismiss-layer"
              onClick={closeSpotOverview}
              aria-label="Close spot overview"
            />
            <motion.div
              className="spot-details-popover"
              role="dialog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              style={{
                "--spot-popover-x": `${overviewPosition.x}px`,
                "--spot-popover-y": `${overviewPosition.y}px`
              }}
            >
              <SpotDetailsCard
                spot={selectedSpot}
                adminMode
                onClose={closeSpotOverview}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
