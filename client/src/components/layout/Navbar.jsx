import { Link } from "react-router-dom";
import { Logo } from "../common/Logo";
import { Button } from "../common/Button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/50 bg-white/65 backdrop-blur-xl">
      <div className="app-shell flex items-center justify-between py-4">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-semibold text-muted md:flex">
          <a href="#features">Features</a>
          <a href="#availability">Availability</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/register">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
