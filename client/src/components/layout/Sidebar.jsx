import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Gauge,
  LayoutDashboard,
  LogOut,
  Map,
  Settings,
  User,
  WalletCards
} from "lucide-react";
import { cn } from "../../utils/formatters";
import { useAuth } from "../../hooks/useAuth";
import { menuByRole } from "../../mockData";
import "./Layout.css";

const menuIcons = {
  Dashboard: LayoutDashboard,
  "Live Map": Map,
  Hardware: Cpu,
  Reports: BarChart3,
  Parking: CarFront,
  Reservations: WalletCards,
  Vehicles: Gauge,
  Profile: User,
  Settings
};

export function Sidebar({ role, isCollapsed = false, onToggle }) {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const items = menuByRole[role] || [];
  const ToggleIcon = isCollapsed ? ChevronRight : ChevronLeft;
  const isActiveRoute = (path) => {
    const isDashboardPath = path === "/admin" || path === "/client";

    if (isDashboardPath) {
      return pathname === path;
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <aside className={cn("sidebar", isCollapsed && "sidebar-collapsed")}>
      <div className="sidebar-header">
        <Link to={role === "ADMIN" ? "/admin" : "/client"} className="sidebar-brand">
          <span className="sidebar-brand-mark">P</span>
          {!isCollapsed && <span className="sidebar-brand-text">Park</span>}
        </Link>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={isCollapsed ? "Extinde meniul" : "Inchide meniul"}
          title={isCollapsed ? "Extinde meniul" : "Inchide meniul"}
        >
          <ToggleIcon size={16} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = menuIcons[item.label] || LayoutDashboard;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "sidebar-link",
                isActiveRoute(item.path) ? "sidebar-link-active" : "sidebar-link-idle"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="sidebar-link-icon" size={16} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-logout"
          onClick={logout}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut size={16} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
