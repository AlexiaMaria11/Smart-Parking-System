import { Link } from "react-router-dom";
import { Logo } from "../common/Logo";
import { Button } from "../common/Button";
import "./Layout.css";

export function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-shell">
        <Logo />
        <nav className="navbar-links">
          <a href="#features">Features</a>
          <a href="#live-map">Live Map</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <div className="navbar-actions">
          <Link to="/login">
            <Button variant="ghost" className="navbar-button navbar-login-button">
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button className="navbar-button">Sign Up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
