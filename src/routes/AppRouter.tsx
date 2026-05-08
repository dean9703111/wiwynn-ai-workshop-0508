import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { VehiclesPage } from "@/pages/VehiclesPage";
import { EmployeesPage } from "@/pages/EmployeesPage";
import { useAuthStore } from "@/stores/auth";

export function AppRouter() {
  const user = useAuthStore((s) => s.user);
  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/employees" element={<EmployeesPage />} />
          </Route>
        </Route>
      </Route>
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}
