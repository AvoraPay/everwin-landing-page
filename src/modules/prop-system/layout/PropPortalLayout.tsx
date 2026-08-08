import { useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  CircleUserRound,
  ExternalLink,
  LayoutDashboard,
  Mail,
  Menu,
  Moon,
  PackageOpen,
  RadioTower,
  Settings2,
  ShieldCheck,
  Sun,
  WalletCards,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { usePropSystem } from "../context";
import { useTheme } from "../theme";

type NavigationItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
};

type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

export function PropPortalLayout() {
  const { currentUser, logout } = usePropSystem();
  const { t } = useTranslation();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  if (!currentUser) return null;

  // i18next's TFunction overloads don't take a bare string as fallback, so wrap it once here.
  const label = (key: string, fallback: string) => t(key, { defaultValue: fallback });
  const navigation = currentUser.role === "admin" ? getAdminNavigation(label) : getClientNavigation(label);
  const currentItem =
    navigation.flatMap((g) => g.items).find((item) => location.pathname.startsWith(item.to)) ??
    navigation[0]?.items[0];

  const isAdmin = currentUser.role === "admin";

  return (
    <div className="flex min-h-screen font-sans antialiased bg-slate-50 text-slate-950 dark:bg-[#181b24] dark:text-white">
      {isAdmin ? (
      <Sidebar
        currentUser={currentUser}
        navigation={navigation}
        open={navOpen}
        onClose={() => setNavOpen(false)}
        onLogout={() => void logout()}
      />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar — matches home navbar dark bg */}
        {isAdmin ? (
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/70 backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#181b24]/70">
            <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 dark:border-white/[0.07] dark:text-white/50 dark:hover:bg-white/[0.04] lg:hidden"
                  onClick={() => setNavOpen(true)}
                  aria-label="Abrir navegação"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <h1 className="truncate text-lg font-semibold text-slate-900 dark:text-white">{currentItem?.label}</h1>
              </div>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <div className="hidden items-center gap-2 md:flex">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{currentUser.name}</p>
                </div>
              </div>
            </div>
          </header>
        ) : (
          /* Client header: logo centred, and only the two actions that matter. */
          <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#181b24]/80 backdrop-blur-xl">
            <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-10 2xl:px-16">
              <div />

              <img
                src="https://i.postimg.cc/RFLkLvK0/everwin-logo.png"
                alt="Everwin"
                className="h-8 w-auto justify-self-center transition-opacity duration-200 hover:opacity-80 sm:h-10"
                draggable={false}
              />

              <div className="flex items-center justify-end gap-2">
                <a
                  href="https://app.everwin.capital/pt/auth/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 font-bricolage_grotesque text-sm font-medium text-white/60 transition-all duration-200 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 sm:px-4"
                >
                  <ExternalLink className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  <span className="hidden sm:inline">Trade Room</span>
                </a>

                <button
                  type="button"
                  onClick={() => void logout()}
                  className="group inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/45 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                  aria-label="Sair da conta"
                >
                  <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </header>
        )}

        <main className={isAdmin ? "flex-1 overflow-auto" : "flex flex-1 flex-col"}>
          <div className={isAdmin ? "mx-auto max-w-7xl px-4 py-6 lg:px-6" : "flex flex-1 flex-col"}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ─── Theme Toggle ─── */

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-700 dark:border-white/[0.07] dark:text-white/50 dark:hover:bg-white/[0.04] dark:hover:text-white"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

/* ─── Sidebar ─── */

function Sidebar({
  currentUser,
  navigation,
  open,
  onClose,
  onLogout,
}: {
  currentUser: NonNullable<ReturnType<typeof usePropSystem>["currentUser"]>;
  navigation: NavigationGroup[];
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="Close navigation"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 dark:border-white/[0.07] dark:bg-[#181b24] lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5 dark:border-white/[0.07]">
          <img
            src="https://i.postimg.cc/RFLkLvK0/everwin-logo.png"
            alt="Everwin"
            className="h-5 w-auto"
            draggable={false}
          />
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-white/40 dark:hover:bg-white/[0.06] dark:hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navigation.map((group, gi) => (
            <div key={group.title} className={cn(gi > 0 && "mt-6")}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/35">{group.title}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                          isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/[0.04] dark:hover:text-white",
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={cn("h-4.5 w-4.5 shrink-0", isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 group-hover:text-slate-600 dark:text-white/35 dark:group-hover:text-white/60")} />
                          {item.label}
                          {isActive && <ChevronRight className="ml-auto h-4 w-4 text-emerald-400" />}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-slate-100 p-3 dark:border-white/[0.07]">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-white/60">
              {currentUser.role === "admin" ? <ShieldCheck className="h-4 w-4" /> : <CircleUserRound className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{currentUser.name}</p>
              <p className="truncate text-xs text-slate-500 dark:text-white/40">{currentUser.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-white/40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </button>
        </div>
      </aside>
    </>
  );
}

/* ─── Navigation Config ─── */

type Translate = (key: string, fallback: string) => string;

/** Grupos na ordem do ciclo de vida: operação (o dia a dia) → inteligência → configuração. */
function getAdminNavigation(t: Translate): NavigationGroup[] {
  return [
    {
      title: "Operação",
      // Ordem do caminho que uma inscrição percorre: chega → é paga → vira conta → consome estoque.
      items: [
        { to: "/prop/admin/dashboard", label: t("prop_portal.layout.nav_admin_dashboard", "Visão Geral"), icon: LayoutDashboard },
        { to: "/prop/admin/submissions", label: "Inscrições", icon: BriefcaseBusiness },
        { to: "/prop/admin/payments", label: "Recebimentos", icon: RadioTower },
        { to: "/prop/admin/accounts", label: "Contas de Operação", icon: WalletCards },
        { to: "/prop/admin/pool", label: "Estoque", icon: PackageOpen },
        { to: "/prop/admin/users", label: "Clientes", icon: CircleUserRound },
      ],
    },
    {
      title: "Inteligência",
      items: [
        { to: "/prop/admin/analytics", label: t("prop_portal.layout.nav_admin_analytics", "Analytics"), icon: BarChart3 },
      ],
    },
    {
      title: "Configuração",
      items: [
        { to: "/prop/admin/settings", label: t("prop_portal.layout.nav_admin_settings", "Configurações"), icon: Settings2 },
        { to: "/prop/admin/emails", label: "Notificações", icon: Mail },
      ],
    },
  ];
}

function getClientNavigation(t: Translate): NavigationGroup[] {
  // The trader has one account and one application — everything fits on one
  // page, so the sidebar stops being a place to hunt through.
  return [
    {
      title: "Minha avaliação",
      items: [
        { to: "/prop/client", label: t("prop_portal.layout.nav_client_dashboard", "Meu portal"), icon: LayoutDashboard },
      ],
    },
  ];
}
