import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../utils/formatters";
import "./Layout.css";

export function DashboardLayout() {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="dashboard-layout">
      <div
        className={cn(
          "dashboard-layout-grid",
          isSidebarCollapsed && "dashboard-layout-grid-collapsed"
        )}
      >
        <Sidebar
          role={user?.role}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed((current) => !current)}
        />
        <main className="dashboard-layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
