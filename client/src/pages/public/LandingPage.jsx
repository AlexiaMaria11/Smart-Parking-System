import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Waves } from "lucide-react";
import { Link } from "react-router-dom";
import parkingHero from "../../assets/parking-hero.png";
import { Navbar } from "../../components/layout/Navbar";
import { Button } from "../../components/common/Button";
import { SectionHeading } from "../../components/common/SectionHeading";
import { landingFeatures, liveStats } from "../../mockData";
import { StatCard } from "../../components/common/StatCard";
import { useLiveParkingStats } from "../../hooks/useLiveParkingStats";

export function LandingPage() {
  const stats = useLiveParkingStats(liveStats);

  return (
    <div>
      <Navbar />
      <section className="overflow-hidden">
        <div className="app-shell grid items-center gap-12 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-primary shadow-soft">
              <Sparkles size={16} />
              Smart university parking orchestration
            </div>
            <h1 className="font-display text-5xl font-semibold leading-tight text-ink sm:text-6xl">
              Find, reserve and manage campus parking with confidence.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              A modern smart parking system for students, staff and administrators, designed around real-time spot visibility, clean dashboards and hardware-ready workflows.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register">
                <Button className="gap-2">
                  Find Parking Spots
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary">Login</Button>
              </Link>
            </div>
            <div id="availability" className="mt-10 grid gap-4 sm:grid-cols-2">
              <StatCard label="Live available spots" value={stats.availableSpots} trend="Updated via Socket.IO" />
              <StatCard label="Occupied spots" value={stats.occupiedSpots} trend="Real-time parking flow" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="relative">
            <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-secondary/25 blur-3xl" />
            <div className="absolute -bottom-12 left-12 h-52 w-52 rounded-full bg-accent/20 blur-3xl" />
            <div className="glass-panel relative overflow-hidden p-4">
              <img src={parkingHero} alt="Smart parking illustration" className="w-full rounded-[28px] object-cover" />
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-10 lg:py-16">
        <div className="app-shell">
          <SectionHeading
            eyebrow="Features"
            title="A polished starter aligned with your Figma direction"
            description="Soft pink surfaces, rounded panels, clean card spacing and dashboard-focused modules mirror the UI style from your existing design."
            align="center"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {landingFeatures.map((feature) => (
              <div key={feature.title} className="glass-panel p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blush text-primary">
                  <feature.icon size={18} />
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="pb-16">
        <div className="app-shell grid gap-6 lg:grid-cols-3">
          <div className="glass-panel p-6">
            <Waves className="text-primary" />
            <h3 className="mt-5 font-display text-2xl font-semibold">Role-based experience</h3>
            <p className="mt-3 text-sm leading-7 text-muted">Admins get operational visibility while clients get a smooth reservation journey and saved vehicles.</p>
          </div>
          <div className="glass-panel p-6">
            <Waves className="text-primary" />
            <h3 className="mt-5 font-display text-2xl font-semibold">Hardware-ready backend</h3>
            <p className="mt-3 text-sm leading-7 text-muted">Sensors, cameras and barriers already have dedicated modules, services and report flows.</p>
          </div>
          <div className="glass-panel p-6">
            <Waves className="text-primary" />
            <h3 className="mt-5 font-display text-2xl font-semibold">AI/OCR placeholder</h3>
            <p className="mt-3 text-sm leading-7 text-muted">The Python service includes the expected capture, detect and OCR stages for license plate recognition.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
