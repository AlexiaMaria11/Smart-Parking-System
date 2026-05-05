import { motion } from "framer-motion";
import parkingHero from "../../assets/parking-hero.png";
import { Logo } from "../common/Logo";
import "./Layout.css";

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth-shell">
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="auth-shell-media"
        aria-hidden="true"
      >
        <div className="auth-shell-media-shell">
          <img src={parkingHero} alt="" className="auth-shell-image" />
        </div>
      </motion.div>
      <div className="auth-shell-overlay" />
      <div className="auth-shell-grid">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="auth-shell-panel"
        >
          <Logo />
          <div className="auth-shell-copy">
            <h1 className="auth-shell-title">{title}</h1>
            <p className="auth-shell-subtitle">{subtitle}</p>
          </div>
          <div className="auth-shell-form">{children}</div>
        </motion.div>
        <div className="auth-shell-spacer" aria-hidden="true" />
      </div>
    </div>
  );
}
