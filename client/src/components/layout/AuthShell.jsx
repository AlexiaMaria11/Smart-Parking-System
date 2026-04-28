import { motion } from "framer-motion";
import parkingHero from "../../assets/parking-hero.png";
import { Logo } from "../common/Logo";
import "./Layout.css";

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth-shell">
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
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="auth-shell-preview"
        >
          <div className="auth-shell-preview-bg" />
          <img src={parkingHero} alt="Smart parking illustration" className="auth-shell-image" />
        </motion.div>
      </div>
    </div>
  );
}
