import { motion } from "framer-motion";
import parkingHero from "../../assets/parking-hero.png";
import { Logo } from "../common/Logo";

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-hero px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-8 sm:p-10"
        >
          <Logo />
          <div className="mt-10 max-w-md">
            <h1 className="font-display text-4xl font-semibold text-ink">{title}</h1>
            <p className="mt-3 text-muted">{subtitle}</p>
          </div>
          <div className="mt-8">{children}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden rounded-[36px] border border-white/60 bg-white/50 p-4 shadow-soft"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(255,231,235,0.45))]" />
          <img src={parkingHero} alt="Smart parking illustration" className="relative z-10 w-full rounded-[28px] object-cover" />
        </motion.div>
      </div>
    </div>
  );
}
