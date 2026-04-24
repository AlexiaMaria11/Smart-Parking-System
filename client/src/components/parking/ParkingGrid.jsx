import { motion } from "framer-motion";
import { cn } from "../../utils/formatters";

const stateClasses = {
  available: "bg-[#b7de7d] text-[#46652d]",
  occupied: "bg-[#f7a9b4] text-[#8b3648]",
  reserved: "bg-[#f5e787] text-[#816c0a]",
  selected: "bg-[#d9a7cf] text-[#703f67]",
  defective: "bg-slate-300 text-slate-700"
};

export function ParkingGrid({ spots, selectedSpot, onSelect }) {
  return (
    <div className="glass-panel p-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {spots.map((spot, index) => (
          <motion.button
            key={spot.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            onClick={() => onSelect?.(spot)}
            className={cn(
              "group relative min-h-28 rounded-[24px] border border-white/50 p-4 text-left shadow-panel transition hover:-translate-y-1",
              stateClasses[spot.state],
              selectedSpot?.id === spot.id ? "ring-4 ring-white/70" : ""
            )}
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.2em]">{spot.id}</span>
              <span className="rounded-full bg-white/60 px-2 py-1 text-[10px] font-semibold uppercase">{spot.state}</span>
            </div>
            <div className="mt-7">
              <p className="font-display text-3xl font-semibold">{spot.number}</p>
              <p className="mt-2 text-sm opacity-80">{spot.price}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
