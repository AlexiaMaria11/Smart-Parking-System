import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Logo } from "../common/Logo";
import { Button } from "../common/Button";
import { cn } from "../../utils/formatters";
import { useAuth } from "../../hooks/useAuth";
import { menuByRole } from "../../mockData";
import "./Layout.css";

export function Sidebar({ role }) {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const items = menuByRole[role] || [];

  return (
    <aside className="sidebar">
      <Logo />
      <nav className="sidebar-nav">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "sidebar-link",
              pathname === item.path ? "sidebar-link-active" : "sidebar-link-idle"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <Button variant="secondary" className="w-full justify-center gap-2" onClick={logout}>
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </aside>
  );
}
