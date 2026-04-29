import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  MapPinned,
  QrCode,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import parkingHero from "../../assets/parking-hero.png";
import { Navbar } from "../../components/layout/Navbar";
import { Button } from "../../components/common/Button";
import { SectionHeading } from "../../components/common/SectionHeading";
import { landingFeatures, parkingSpots } from "../../mockData";
import { ParkingGrid } from "../../components/parking/ParkingGrid";
import "./LandingPage.css";

export function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroFilter = useTransform(
    scrollYProgress,
    [0, 1],
    ["blur(0px)", "blur(10px)"],
  );
  const heroY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -150], // se duce în sus
  );

  return (
    <div>
      <Navbar />
      <motion.section ref={heroRef} className="landing-hero">
        <motion.div
          className="landing-hero-media"
          style={{ filter: heroFilter }}
          aria-hidden="true"
        >
          <div className="landing-hero-media-shell">
            <img src={parkingHero} alt="" className="landing-hero-image" />
          </div>
        </motion.div>
        <div className="landing-hero-overlay" />
        <div className="landing-hero-content">
          <motion.div style={{ y: heroY }} className="landing-hero-copy">
            <div className="landing-eyebrow">
              <Sparkles size={16} />
              Smart parking — powered by real-time data
            </div>
            <h1 className="landing-title">
              Find, reserve and manage parking — without the hassle.
            </h1>
            <p className="landing-description">
              A modern smart parking system for drivers, staff and
              administrators. See live spot availability, reserve your space in
              seconds, and let the system handle the rest.
            </p>
            <div className="landing-actions">
              <Link to="/register">
                <Button className="gap-2">
                  Find a Spot
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary">Login</Button>
              </Link>
            </div>
          </motion.div>
          <div className="landing-hero-spacer" aria-hidden="true" />
        </div>
      </motion.section>

      <section id="features" className="landing-features">
        <div className="app-shell">
          <SectionHeading
            eyebrow="Features"
            title="Everything you need for smarter parking"
            description="Live availability, quick reservations and role-based tools keep the whole parking flow clear from arrival to admin reporting."
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

      <section id="live-map" className="landing-live-map">
        <div className="app-shell">
          <SectionHeading
            eyebrow="Live map"
            title="See parking availability before you arrive"
            description="Check live spot states, compare prices and inspect restrictions from the public map preview."
            align="center"
          />
          <div className="landing-live-map-grid">
            <ParkingGrid
              spots={parkingSpots}
              isInteractive={false}
            />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="landing-how">
        <div className="app-shell">
          <SectionHeading
            eyebrow="How it works"
            title="Find, reserve, park"
            description="A simple flow for drivers, backed by real-time data and clean access control."
            align="center"
          />
          <div className="landing-how-grid">
            <div className="landing-card">
              <div className="landing-step-icon">
                <MapPinned size={20} />
              </div>
              <p className="landing-step-label">Step 1 - Find</p>
              <h3 className="landing-card-title">Open the live map</h3>
              <p className="landing-card-description">
                See which spots are available right now, updated in real time.
              </p>
            </div>
            <div className="landing-card">
              <div className="landing-step-icon">
                <CheckCircle2 size={20} />
              </div>
              <p className="landing-step-label">Step 2 - Reserve</p>
              <h3 className="landing-card-title">Confirm your booking</h3>
              <p className="landing-card-description">
                Select your spot, choose your time window, and confirm your
                reservation instantly.
              </p>
            </div>
            <div className="landing-card">
              <div className="landing-step-icon">
                <QrCode size={20} />
              </div>
              <p className="landing-step-label">Step 3 - Park</p>
              <h3 className="landing-card-title">Show your QR code</h3>
              <p className="landing-card-description">
                Head to your spot. Show your QR code at the entrance and you're
                good to go.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-footer-cta">
        <div className="app-shell">
          <div className="landing-footer-cta-inner">
            <div>
              <h2 className="landing-footer-title">
                Ready to stop searching for a parking spot?
              </h2>
              <p className="landing-footer-description">
                Join hundreds of drivers and administrators already using Park
                Smart System.
              </p>
            </div>
            <Link to="/register">
              <Button className="gap-2">
                Create your free account
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
