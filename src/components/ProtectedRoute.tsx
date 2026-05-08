import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth";
import type { Role } from "@/types";

interface ProtectedRouteProps {
  requiredRole?: Role;
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const denied = !!user && !!requiredRole && user.role !== requiredRole;

  useEffect(() => {
    if (denied) {
      toast.error("您沒有權限存取此頁面");
    }
  }, [denied]);

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (denied) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
