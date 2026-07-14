import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usePropSystem } from "./context";
import type { UserRole } from "./types";

export function RequireAuth() {
  const { currentUser, bootstrapping } = usePropSystem();
  const location = useLocation();

  if (bootstrapping) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/prop/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function RequireRole({ role }: { role: UserRole }) {
  const { currentUser, bootstrapping } = usePropSystem();

  if (bootstrapping) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/prop/login" replace />;
  }

  if (currentUser.role !== role) {
    return <Navigate to={currentUser.role === "admin" ? "/prop/admin/dashboard" : "/prop/client/dashboard"} replace />;
  }

  return <Outlet />;
}
