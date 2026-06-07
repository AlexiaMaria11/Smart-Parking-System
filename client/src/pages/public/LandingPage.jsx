import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  CarFront,
  CheckCircle2,
  MapPinned,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import parkingHero from "../../assets/parking-hero.png";
import { Navbar } from "../../components/layout/Navbar";
import { Button } from "../../components/common/Button";
import { SectionHeading } from "../../components/common/SectionHeading";
import { landingFeatures } from "../../constants/mock.data";
import { ParkingGrid } from "../../components/parking/ParkingGrid";
import { useLiveSpots } from "../../hooks/useLiveSpots";
import "./LandingPage.css";

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 22, delay: i * 0.1 },
  }),
};

const stepVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      delay: i * 0.12,
    },
  }),
};

export function LandingPage() {
  const { spots: liveSpots, availableSpots, occupiedSpots, isLoading } = useLiveSpots();

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
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -150]);

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
            <motion.h1
              className="landing-title"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
            >
              Find, reserve and manage parking — without the hassle.
            </motion.h1>
            <motion.p
              className="landing-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              A modern smart parking system for clients and administrators. See
              live spot availability, reserve your space in seconds, and let the
              system handle the rest.
            </motion.p>
            <motion.div
              className="landing-actions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32, ease: "easeOut" }}
            >
              <Link to="/register">
                <Button className="landing-cta-button gap-2">
                  Find a Spot
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" className="landing-cta-button">
                  Login
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          <div className="landing-hero-spacer" aria-hidden="true" />
        </div>
      </motion.section>

      <section id="features" className="landing-features">
        <div className="app-shell">
          <SectionHeading
            eyebrow="Features"
            title="Everything you need for smarter parking"
            description="Live availability, quick reservations and role-based tools keep the whole parking flow clear from client bookings to admin reporting."
            align="center"
          />
          <div className="landing-feature-grid">
            {landingFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="landing-card"
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{
                  y: -6,
                  boxShadow: "0 24px 48px rgba(189, 57, 82, 0.14)",
                }}
              >
                <motion.div
                  className="landing-feature-icon"
                  whileHover={{ scale: 1.12, rotate: 6 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <feature.icon size={18} />
                </motion.div>
                <h3 className="landing-card-title">{feature.title}</h3>
                <p className="landing-card-description">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="live-map" className="landing-live-map">
        <div className="app-shell">
          <SectionHeading
            eyebrow="Live map"
            title="See parking availability before you arrive"
            description={
              isLoading
                ? "Connecting to live feed..."
                : `${availableSpots} free · ${occupiedSpots} occupied · live updates`
            }
            align="center"
          />
          <motion.div
            className="landing-live-map-grid"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <ParkingGrid spots={liveSpots} isInteractive={false} />
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="landing-how">
        <div className="app-shell">
          <SectionHeading
            eyebrow="How it works"
            title="Find, reserve, park"
            description="A simple flow for clients, backed by real-time data and clean access control."
            align="center"
          />
          <div className="landing-how-grid">
            {[
              {
                icon: MapPinned,
                step: "Step 1 - Find",
                title: "Open the live map",
                description:
                  "See which spots are available right now, updated in real time.",
              },
              {
                icon: CheckCircle2,
                step: "Step 2 - Reserve",
                title: "Confirm your booking",
                description:
                  "Select your spot, choose your time window, and confirm your reservation instantly.",
              },
              {
                icon: CarFront,
                step: "Step 3 - Park",
                title: "Arrive and park",
                description:
                  "Head to your reserved spot and keep track of the reservation status from your client dashboard.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="landing-card"
                custom={i}
                variants={stepVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{
                  y: -6,
                  boxShadow: "0 24px 48px rgba(189, 57, 82, 0.14)",
                }}
              >
                <motion.div
                  className="landing-step-icon"
                  whileHover={{ scale: 1.12 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <item.icon size={20} />
                </motion.div>
                <p className="landing-step-label">{item.step}</p>
                <h3 className="landing-card-title">{item.title}</h3>
                <p className="landing-card-description">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-footer-cta">
        <div className="landing-footer-cta-inner">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="landing-footer-title">
              Ready to stop searching for a parking spot?
            </h2>
            <p className="landing-footer-description">
              Join hundreds of clients and administrators already using Park
              Smart System.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            <Link to="/register">
              <Button variant="secondary" className="landing-cta-button gap-2">
                Create your free account
                <ArrowRight size={16} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
