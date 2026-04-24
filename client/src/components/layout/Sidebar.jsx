import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Logo } from "../common/Logo";
import { Button } from "../common/Button";
import { cn } from "../../utils/formatters";
import { useAuth } from "../../hooks/useAuth";
import { menuByRole } from "../../mockData";

export function Sidebar({ role }) {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const items = menuByRole[role] || [];

  return (
    <aside className="glass-panel flex h-full flex-col p-4">
      <Logo />
      <nav className="mt-10 space-y-2">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "block rounded-2xl px-4 py-3 text-sm font-semibold transition",
              pathname === item.path ? "bg-primary text-white shadow-soft" : "text-muted hover:bg-white"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-6">
        <Button variant="secondary" className="w-full justify-center gap-2" onClick={logout}>
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </aside>
  );
}
