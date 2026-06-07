import { useEffect, useState } from "react";
import { socket } from "../services/socket";

function deriveState(raw) {
  if (!raw.isAvailable) return raw.spotType === "CONFLICT" ? "conflict" : "occupied";
  if (raw.hasUpcoming) return "reserved";
  return "available";
}

function formatSpot(raw) {
  return {
    id: raw.id,
    code: raw.code,
    spotType: raw.spotType,
    state: deriveState(raw),
    price: `${raw.pricePerHour} RON/h`,
    pricePerHour: raw.pricePerHour,
    plate: raw.occupiedBy?.licensePlate ?? null,
    user: raw.occupiedBy?.userName ?? null,
    endTime: raw.occupiedBy?.endTime ?? null,
    entryType: raw.occupiedBy?.type ?? null,
  };
}

export function useLiveSpots() {
  const [spots, setSpots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    socket.connect();

    const handleBootstrap = ({ spots: rawSpots }) => {
      setSpots(rawSpots.map(formatSpot));
      setIsLoading(false);
    };

    const handleSpotUpdated = (raw) => {
      setSpots((prev) =>
        prev.map((s) => (s.id === raw.id ? formatSpot(raw) : s)),
      );
    };

    socket.on("parking:bootstrap", handleBootstrap);
    socket.on("parking:spot:updated", handleSpotUpdated);

    return () => {
      socket.off("parking:bootstrap", handleBootstrap);
      socket.off("parking:spot:updated", handleSpotUpdated);
      socket.disconnect();
    };
  }, []);

  const availableSpots = spots.filter((s) => s.state === "available").length;
  const occupiedSpots = spots.length - availableSpots;

  return { spots, availableSpots, occupiedSpots, isLoading };
}
