import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";

export function DashboardLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 lg:grid-cols-[260px_1fr]">
        <Sidebar role={user?.role} />
        <main className="glass-panel overflow-hidden p-5 sm:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
