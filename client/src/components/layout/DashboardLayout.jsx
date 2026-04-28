import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";
import "./Layout.css";

export function DashboardLayout() {
  const { user } = useAuth();

  return (
    <div className="dashboard-layout">
      <div className="dashboard-layout-grid">
        <Sidebar role={user?.role} />
        <main className="dashboard-layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
