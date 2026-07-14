import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePropSystem } from "../context";

export function PropPortalEntry() {
  const { currentUser, bootstrapping } = usePropSystem();
  const { t } = useTranslation();

  if (bootstrapping) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">{t("prop_portal.entry.loading")}</div>;
  }

  if (!currentUser) {
    return <Navigate to="/prop/login" replace />;
  }

  return <Navigate to={currentUser.role === "admin" ? "/prop/admin/dashboard" : "/prop/client/dashboard"} replace />;
}
