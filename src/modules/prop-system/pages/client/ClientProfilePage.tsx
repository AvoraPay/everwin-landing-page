import { useMemo } from "react";
import {
  Activity,
  Calendar,
  CheckCircle2,
  Globe,
  Languages,
  Lock,
  Mail,
  ShieldCheck,
  TrendingUp,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../../../lib/utils";
import { usePropSystem } from "../../context";
import { buildAccountAnalytics, currencyBRL, formatPropDate, getPlanById } from "../../rules";
import {
  PortalPageHeader,
  PortalSection,
  PortalStatCard,
  PortalStatusPill,
  PortalSurface,
} from "../../portal-ui";

const LANGUAGES = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

export function ClientProfilePage() {
  const { currentUser, getUserAccounts, state } = usePropSystem();
  const { i18n } = useTranslation();

  if (!currentUser) return null;

  const accountViews = useMemo(() => {
    const nowISO = new Date().toISOString();
    return getUserAccounts(currentUser.id).map((account) => {
      const plan = getPlanById(state.plans, account.planId);
      const analytics = buildAccountAnalytics(account, plan, nowISO);
      return { account, plan, analytics };
    });
  }, [currentUser.id, getUserAccounts, state.plans]);

  const activeAccounts = accountViews.filter((e) => e.account.status === "active").length;
  const completedAccounts = accountViews.filter(
    (e) => e.account.status === "passed" || e.account.status === "approved_for_funded",
  ).length;
  const failedAccounts = accountViews.filter(
    (e) => e.account.status === "failed_drawdown" || e.account.status === "failed_timeout",
  ).length;
  const consolidatedBalance = accountViews.reduce((s, e) => s + e.account.balance, 0);
  const currentLang = LANGUAGES.find((l) => i18n.language.startsWith(l.code)) ?? LANGUAGES[0];

  return (
    <div className="space-y-6">
      <PortalPageHeader title="Perfil" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalStatCard label="Total" value={accountViews.length} tone="neutral" icon={<Activity className="h-4 w-4" />} />
        <PortalStatCard label="Ativas" value={activeAccounts} tone="success" icon={<ShieldCheck className="h-4 w-4" />} />
        <PortalStatCard label="Concluídas" value={completedAccounts} tone="info" icon={<TrendingUp className="h-4 w-4" />} />
        <PortalStatCard label="Saldo" value={currencyBRL(consolidatedBalance, i18n.language)} helper={failedAccounts > 0 ? `${failedAccounts} falha(s)` : undefined} tone="warning" icon={<Wallet className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Identity */}
        <PortalSection title="Identidade">
          <div className="space-y-0 divide-y divide-slate-100 dark:divide-white/[0.05]">
            <ProfileRow icon={<User className="h-4 w-4" />} label="Nome" value={currentUser.name}>
              <span className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-white/35">
                <Calendar className="h-3 w-3" />
                Desde {formatPropDate(currentUser.createdAt, i18n.language)}
              </span>
            </ProfileRow>
            <ProfileRow icon={<Mail className="h-4 w-4" />} label="Email" value={currentUser.email}>
              {currentUser.primaryEmail ? (
                <span className="text-[11px] text-slate-400 dark:text-white/35">{currentUser.primaryEmail}</span>
              ) : null}
            </ProfileRow>
            <ProfileRow icon={<ShieldCheck className="h-4 w-4" />} label="Status">
              <PortalStatusPill tone={currentUser.status === "active" ? "success" : "danger"}>
                {currentUser.status === "active" ? "Ativo" : "Bloqueado"}
              </PortalStatusPill>
            </ProfileRow>
            <ProfileRow icon={<Lock className="h-4 w-4" />} label="Segurança" value="Protegido">
              <span className="text-[11px] text-slate-400 dark:text-white/35">Fluxo do portal</span>
            </ProfileRow>
          </div>
        </PortalSection>

        {/* Language */}
        <PortalSection title="Idioma">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => void i18n.changeLanguage(lang.code)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition",
                    currentLang.code === lang.code
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#171a23] text-slate-600 dark:text-white/60 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]",
                  )}
                >
                  <span className="text-base">{lang.flag}</span>
                  {lang.label}
                </button>
              ))}
            </div>
            <PortalSurface tone="subtle" padding="sm">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-slate-400 dark:text-white/35" />
                <div>
                  <p className="text-sm font-medium text-slate-950 dark:text-white">Idioma atual</p>
                  <p className="text-xs text-slate-500 dark:text-white/40">{currentLang.flag} {currentLang.label}</p>
                </div>
              </div>
            </PortalSurface>
          </div>
        </PortalSection>
      </div>

      {/* Overview */}
      <PortalSection title="Resumo">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MiniStat icon={<Activity className="h-4 w-4 text-emerald-600" />} label="Ativas" value={activeAccounts} />
          <MiniStat icon={<CheckCircle2 className="h-4 w-4 text-sky-600" />} label="Concluídas" value={completedAccounts} />
          <MiniStat icon={<XCircle className="h-4 w-4 text-red-500" />} label="Falhas" value={failedAccounts} />
          <MiniStat icon={<Wallet className="h-4 w-4 text-amber-600" />} label="Saldo total" value={currencyBRL(consolidatedBalance, i18n.language)} />
        </div>
      </PortalSection>
    </div>
  );
}

/* ─── Profile Row ─── */

function ProfileRow({
  icon,
  label,
  value,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/40">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400 dark:text-white/35">{label}</p>
        {value ? <p className="mt-0.5 text-sm font-semibold text-slate-950 dark:text-white">{value}</p> : null}
        {children ? <div className="mt-0.5">{children}</div> : null}
      </div>
    </div>
  );
}

/* ─── Mini Stat ─── */

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.04] px-4 py-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-[#171a23] shadow-sm">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-400 dark:text-white/35">{label}</p>
        <p className="text-sm font-semibold text-slate-950 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
