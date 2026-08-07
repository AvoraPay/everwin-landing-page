import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  CreditCard,
  FileText,
  IdCard,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePropSystem } from "../../context";
import { formatPropDate, formatPropMoney, getPlanById } from "../../rules";
import { getPaymentStatusMeta, getSubmissionStatusMeta } from "../../portal-presentation";
import {
  PortalEmptyState,
  PortalLoadingState,
  PortalPageHeader,
  PortalSection,
  PortalStatusPill,
  PortalSurface,
} from "../../portal-ui";
import { fetchMySubmissionsApi } from "../../api";
import type { ClientSubmissionItem, PlanTemplate, SubmissionStatus } from "../../types";

/** The journey, in the order the applicant actually lives it. */
const JOURNEY = [
  { key: "submitted", label: "Inscrição enviada", hint: "Formulário recebido", icon: FileText },
  { key: "payment", label: "Pagamento", hint: "Taxa de avaliação", icon: CreditCard },
  { key: "review", label: "Análise", hint: "Conferência do perfil", icon: ShieldCheck },
  { key: "access", label: "Acesso liberado", hint: "Login do portal", icon: KeyRound },
  { key: "account", label: "Conta de avaliação", hint: "Pronta para operar", icon: Target },
] as const;

function journeyIndex(status: SubmissionStatus): number {
  switch (status) {
    case "submitted":
      return 0;
    case "payment_pending":
    case "payment_overdue":
      return 1;
    case "payment_approved":
    case "under_review":
      return 2;
    case "access_ready":
      return 3;
    case "account_ready":
      return 4;
    default:
      return -1;
  }
}

const shortDate = { day: "2-digit", month: "2-digit", year: "numeric" } as const;

export function ClientSubmissionsPage() {
  const { state } = usePropSystem();
  const { i18n } = useTranslation();

  const [submissions, setSubmissions] = useState<ClientSubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMySubmissionsApi()
      .then((data) => {
        if (!cancelled) setSubmissions(data);
      })
      .catch(() => {
        if (!cancelled) setSubmissions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <PortalPageHeader
        eyebrow="Meu portal"
        title="Minha inscrição"
        description="Tudo que você enviou e onde seu processo está agora."
      />

      {loading ? (
        <PortalLoadingState title="Carregando sua inscrição..." lines={4} />
      ) : submissions.length === 0 ? (
        <PortalEmptyState
          title="Nenhuma inscrição encontrada"
          description="Quando você se candidatar pelo site, sua inscrição e o andamento do pagamento aparecem aqui."
          icon={<FileText className="h-8 w-8" />}
        />
      ) : (
        <div className="space-y-10">
          {submissions.map((submission) => (
            <SubmissionDetail
              key={submission.id}
              submission={submission}
              plans={state.plans}
              language={i18n.language}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionDetail({
  submission,
  plans,
  language,
}: {
  submission: ClientSubmissionItem;
  plans: PlanTemplate[];
  language: string;
}) {
  const plan = useMemo(() => {
    try {
      return getPlanById(plans, submission.planId);
    } catch {
      return null;
    }
  }, [plans, submission.planId]);

  const currency = submission.currency ?? plan?.currency ?? "BRL";
  const status = getSubmissionStatusMeta(submission.status as SubmissionStatus, language);
  const payment = getPaymentStatusMeta(
    submission.paymentStatus as Parameters<typeof getPaymentStatusMeta>[0],
    language,
  );

  const step = journeyIndex(submission.status as SubmissionStatus);
  const awaitingPayment = submission.paymentStatus !== "approved";
  const checkoutUrl = submission.payment?.checkoutUrl;

  return (
    <div className="space-y-5">
      {/* Headline: code, plan and where it stands */}
      <PortalSurface padding="none" className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-white/35">
              Código da inscrição
            </p>
            <p className="mt-1 font-mono text-xl font-bold text-slate-950 dark:text-white">
              {submission.submissionCode}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-white/45">
              {plan?.name ?? submission.planId}
              {plan ? ` · capital ${formatPropMoney(plan.accountSize, currency, language)}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PortalStatusPill tone={status.tone}>{status.label}</PortalStatusPill>
            <PortalStatusPill tone={payment.tone}>{payment.label}</PortalStatusPill>
          </div>
        </div>

        {/* Journey */}
        <div className="border-t border-slate-100 px-6 py-6 dark:border-white/[0.05]">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {JOURNEY.map((entry, index) => {
              const done = step >= 0 && index < step;
              const current = step === index;
              const Icon = entry.icon;
              return (
                <div key={entry.key} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                      done
                        ? "border-emerald-500/30 bg-emerald-500/12 text-emerald-500"
                        : current
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-300 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-white/20"
                    }`}
                  >
                    {done ? <BadgeCheck className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold ${
                        done || current ? "text-slate-950 dark:text-white" : "text-slate-400 dark:text-white/30"
                      }`}
                    >
                      {entry.label}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-slate-400 dark:text-white/30">{entry.hint}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* The one action that matters, when it matters */}
        {awaitingPayment && checkoutUrl ? (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-emerald-500/20 bg-emerald-500/[0.07] px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                Falta o pagamento da taxa de avaliação
              </p>
              <p className="mt-0.5 text-xs text-emerald-700/80 dark:text-emerald-400/70">
                Assim que o pagamento for confirmado, sua conta é liberada automaticamente.
              </p>
            </div>
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              Pagar {submission.amount ? formatPropMoney(submission.amount, currency, language) : "agora"}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        ) : null}
      </PortalSurface>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        {/* What the applicant filled in */}
        <PortalSection title="Seus dados" description="O que você preencheu no formulário de candidatura">
          <div className="space-y-5">
            <FieldGrid
              fields={[
                { icon: IdCard, label: "Nome completo", value: submission.fullName },
                { icon: Mail, label: "E-mail", value: submission.email },
                { icon: Phone, label: "Telefone", value: submission.phone },
                {
                  icon: IdCard,
                  label: submission.documentType || "Documento",
                  value: submission.documentNumber,
                },
                {
                  icon: Building2,
                  label: "Localização",
                  value: [submission.city, submission.country].filter(Boolean).join(", "),
                },
                { icon: Building2, label: "Profissão", value: submission.occupation },
              ]}
            />

            <div className="border-t border-slate-100 pt-5 dark:border-white/[0.05]">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-white/35">
                Perfil operacional
              </p>
              <FieldGrid
                fields={[
                  { icon: TrendingUp, label: "Experiência", value: submission.experience },
                  { icon: CalendarClock, label: "Sessão principal", value: submission.session },
                  { icon: ShieldCheck, label: "Risco por dia", value: submission.riskPerDay },
                ]}
              />
            </div>

            {submission.motivation && submission.motivation !== "-" ? (
              <LongAnswer label="Por que quer entrar no programa" value={submission.motivation} />
            ) : null}
            {submission.consistency && submission.consistency !== "-" ? (
              <LongAnswer label="Como mantém consistência" value={submission.consistency} />
            ) : null}
          </div>
        </PortalSection>

        {/* Money and dates */}
        <div className="space-y-5">
          <PortalSection title="Pagamento" description="Taxa de avaliação">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 dark:border-white/[0.05] dark:bg-white/[0.02]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-white/35">
                  Valor
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                  {submission.amount != null
                    ? formatPropMoney(submission.amount, currency, language)
                    : plan
                      ? formatPropMoney(plan.fee, currency, language)
                      : "-"}
                </p>
                <div className="mt-3">
                  <PortalStatusPill tone={payment.tone}>{payment.label}</PortalStatusPill>
                </div>
              </div>

              <FieldGrid
                columns={1}
                fields={[
                  { icon: CreditCard, label: "Código do pagamento", value: submission.payment?.paymentCode },
                  {
                    icon: CalendarClock,
                    label: "Enviado em",
                    value: formatPropDate(submission.submittedAt, language, shortDate),
                  },
                  {
                    icon: BadgeCheck,
                    label: "Pagamento confirmado",
                    value: submission.paidAt ? formatPropDate(submission.paidAt, language, shortDate) : null,
                  },
                  {
                    icon: ShieldCheck,
                    label: "Analisado em",
                    value: submission.reviewedAt ? formatPropDate(submission.reviewedAt, language, shortDate) : null,
                  },
                ]}
              />
            </div>
          </PortalSection>

          {plan ? (
            <PortalSection title="Regras do plano" description="Válidas para esta avaliação">
              <FieldGrid
                columns={2}
                fields={[
                  { icon: Target, label: "Meta fase 1", value: `${plan.profitTargetPhase1Pct}%` },
                  { icon: Target, label: "Meta fase 2", value: `${plan.profitTargetPhase2Pct}%` },
                  { icon: ShieldCheck, label: "Drawdown máx.", value: `${plan.maxDrawdownPct}%` },
                  { icon: ShieldCheck, label: "Perda diária", value: `${plan.dailyLossLimitPct}%` },
                  { icon: CalendarClock, label: "Dias mínimos", value: `${plan.minTradingDays}` },
                  { icon: CalendarClock, label: "Duração", value: `${plan.durationDays} dias` },
                ]}
              />
            </PortalSection>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FieldGrid({
  fields,
  columns = 2,
}: {
  fields: Array<{ icon: typeof Mail; label: string; value?: string | null }>;
  columns?: 1 | 2;
}) {
  return (
    <div className={`grid gap-x-6 gap-y-4 ${columns === 1 ? "grid-cols-1" : "sm:grid-cols-2"}`}>
      {fields.map((field) => {
        const Icon = field.icon;
        const empty = !field.value || field.value === "-";
        return (
          <div key={field.label} className="flex items-start gap-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 dark:text-white/25" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-400 dark:text-white/35">{field.label}</p>
              <p
                className={`mt-0.5 break-words text-sm ${
                  empty ? "text-slate-300 dark:text-white/20" : "font-medium text-slate-950 dark:text-white"
                }`}
              >
                {empty ? "não informado" : field.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LongAnswer({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
      <p className="text-[11px] font-medium text-slate-400 dark:text-white/35">{label}</p>
      <p className="mt-1.5 text-sm leading-6 text-slate-700 dark:text-white/70">{value}</p>
    </div>
  );
}
