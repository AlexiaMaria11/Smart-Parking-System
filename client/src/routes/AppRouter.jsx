import { Navigate, Route, Routes } from "react-router-dom";
import { ROUTE_PATHS } from "../constants/routes";
import { ROLES } from "../constants/roles";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { LandingPage } from "../pages/public/LandingPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminLiveMapPage } from "../pages/admin/AdminLiveMapPage";
import { AdminHardwarePage } from "../pages/admin/AdminHardwarePage";
import { AdminReportsPage } from "../pages/admin/AdminReportsPage";
import { ClientDashboardPage } from "../pages/client/ClientDashboardPage";
import { ClientParkingPage } from "../pages/client/ClientParkingPage";
import { ClientReservationsPage } from "../pages/client/ClientReservationsPage";
import { ClientVehiclesPage } from "../pages/client/ClientVehiclesPage";
import { ClientProfilePage } from "../pages/client/ClientProfilePage";

export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTE_PATHS.LANDING} element={<LandingPage />} />
      <Route path={ROUTE_PATHS.LOGIN} element={<LoginPage />} />
      <Route path={ROUTE_PATHS.REGISTER} element={<RegisterPage />} />

      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTE_PATHS.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
          <Route path={ROUTE_PATHS.ADMIN_MAP} element={<AdminLiveMapPage />} />
          <Route path={ROUTE_PATHS.ADMIN_HARDWARE} element={<AdminHardwarePage />} />
          <Route path={ROUTE_PATHS.ADMIN_REPORTS} element={<AdminReportsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.CLIENT]} />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTE_PATHS.CLIENT_DASHBOARD} element={<ClientDashboardPage />} />
          <Route path={ROUTE_PATHS.CLIENT_PARKING} element={<ClientParkingPage />} />
          <Route path={ROUTE_PATHS.CLIENT_RESERVATIONS} element={<ClientReservationsPage />} />
          <Route path={ROUTE_PATHS.CLIENT_VEHICLES} element={<ClientVehiclesPage />} />
          <Route path={ROUTE_PATHS.CLIENT_PROFILE} element={<ClientProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={ROUTE_PATHS.LANDING} replace />} />
    </Routes>
  );
}
