import { useEffect, useState } from "react";
import { socket } from "../services/socket";

export function useLiveParkingStats(initialStats) {
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    socket.connect();

    const handleBootstrap = (payload) => {
      setStats((current) => ({
        ...current,
        availableSpots: payload.availableSpots,
        occupiedSpots: payload.occupiedSpots
      }));
    };

    socket.on("parking:bootstrap", handleBootstrap);
    socket.on("parking:spot:updated", handleBootstrap);

    return () => {
      socket.off("parking:bootstrap", handleBootstrap);
      socket.off("parking:spot:updated", handleBootstrap);
      socket.disconnect();
    };
  }, []);

  return stats;
}
