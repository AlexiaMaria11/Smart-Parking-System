import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Waves } from "lucide-react";
import { Link } from "react-router-dom";
import parkingHero from "../../assets/parking-hero.png";
import { Navbar } from "../../components/layout/Navbar";
import { Button } from "../../components/common/Button";
import { SectionHeading } from "../../components/common/SectionHeading";
import { landingFeatures, liveStats } from "../../mockData";
import { StatCard } from "../../components/common/StatCard";
import { useLiveParkingStats } from "../../hooks/useLiveParkingStats";
import "./LandingPage.css";

export function LandingPage() {
  const heroRef = useRef(null);
  const stats = useLiveParkingStats(liveStats);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroFilter = useTransform(scrollYProgress, [0, 1], ["blur(0px)", "blur(10px)"]);
  const heroImageY = useTransform(scrollYProgress, [0, 1], ["0px", "-140px"]);

  return (
    <div>
      <Navbar />
      <motion.section
        ref={heroRef}
        className="landing-hero"
        style={{ filter: heroFilter }}
      >
        <motion.div
          className="landing-hero-media"
          style={{ y: heroImageY }}
          aria-hidden="true"
        >
          <div className="landing-hero-media-shell">
            <img src={parkingHero} alt="" className="landing-hero-image" />
          </div>
        </motion.div>
        <div className="landing-hero-overlay" />
        <div className="landing-hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="landing-hero-copy"
          >
            <div className="landing-eyebrow">
              <Sparkles size={16} />
              Smart university parking orchestration
            </div>
            <h1 className="landing-title">
              Find, reserve and manage campus parking with confidence.
            </h1>
            <p className="landing-description">
              A modern smart parking system for students, staff and
              administrators, designed around real-time spot visibility, clean
              dashboards and hardware-ready workflows.
            </p>
            <div className="landing-actions">
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
            <div id="availability" className="landing-stats">
              <StatCard
                label="Live available spots"
                value={stats.availableSpots}
                trend="Updated via Socket.IO"
              />
              <StatCard
                label="Occupied spots"
                value={stats.occupiedSpots}
                trend="Real-time parking flow"
              />
            </div>
          </motion.div>
          <div className="landing-hero-spacer" aria-hidden="true" />
        </div>
      </motion.section>

      <section id="features" className="landing-features">
        <div className="app-shell">
          <SectionHeading
            eyebrow="Features"
            title="A polished starter aligned with your Figma direction"
            description="Soft pink surfaces, rounded panels, clean card spacing and dashboard-focused modules mirror the UI style from your existing design."
            align="center"
          />
          <div className="landing-feature-grid">
            {landingFeatures.map((feature) => (
              <div key={feature.title} className="landing-card">
                <div className="landing-feature-icon">
                  <feature.icon size={18} />
                </div>
                <h3 className="landing-card-title">{feature.title}</h3>
                <p className="landing-card-description">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="landing-how">
        <div className="landing-how-grid">
          <div className="landing-card">
            <Waves className="text-primary" />
            <h3 className="landing-card-title">Role-based experience</h3>
            <p className="landing-card-description">
              Admins get operational visibility while clients get a smooth
              reservation journey and saved vehicles.
            </p>
          </div>
          <div className="landing-card">
            <Waves className="text-primary" />
            <h3 className="landing-card-title">Hardware-ready backend</h3>
            <p className="landing-card-description">
              Sensors, cameras and barriers already have dedicated modules,
              services and report flows.
            </p>
          </div>
          <div className="landing-card">
            <Waves className="text-primary" />
            <h3 className="landing-card-title">AI/OCR placeholder</h3>
            <p className="landing-card-description">
              The Python service includes the expected capture, detect and OCR
              stages for license plate recognition.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
