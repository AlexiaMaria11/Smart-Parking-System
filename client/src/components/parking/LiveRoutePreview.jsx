import { motion } from "framer-motion";

export function LiveRoutePreview() {
  return (
    <div className="glass-panel relative overflow-hidden p-6">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Animated idea</p>
        <h3 className="mt-2 font-display text-2xl font-semibold">Car route to selected parking spot</h3>
      </div>
      <div className="relative h-52 rounded-[28px] bg-[linear-gradient(180deg,_#fff_0%,_#ffeef1_100%)]">
        <div className="absolute left-6 top-10 h-3/4 w-[calc(100%-3rem)] rounded-[36px] border-[10px] border-dashed border-[#7ba8f2]/70" />
        <motion.div
          animate={{ x: [0, 260, 440], y: [0, 82, 132] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-10 top-8 h-10 w-16 rounded-[18px] bg-primary shadow-soft"
        />
        <div className="absolute bottom-5 right-6 rounded-2xl bg-accent/30 px-4 py-3 text-sm font-semibold text-ink">
          Target spot: C-11
        </div>
      </div>
    </div>
  );
}
