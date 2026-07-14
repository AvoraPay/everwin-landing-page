import { useEffect, useState } from "react";
import {
  FileText,
  CreditCard,
  Clock,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePropSystem } from "../../context";
import { formatPropDate, getPlanById } from "../../rules";
import {
  getSubmissionStatusMeta,
  getPaymentStatusMeta,
} from "../../portal-presentation";
import {
  PortalEmptyState,
  PortalLoadingState,
  PortalMetricList,
  PortalPageHeader,
  PortalSection,
  PortalStatusPill,
  PortalSurface,
} from "../../portal-ui";
import { fetchMySubmissionsApi } from "../../api";
import type { ClientSubmissionItem, PlanTemplate } from "../../types";

export function ClientSubmissionsPage() {
  const { state } = usePropSystem();
  const { i18n } = useTranslation();

  const [submissions, setSubmissions] = useState<ClientSubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <PortalPageHeader
          eyebrow="Meu portal"
          title="Minhas Inscricoes"
          description="Historico de inscricoes e pagamentos"
        />
        <PortalLoadingState title="Carregando inscricoes..." lines={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Meu portal"
        title="Minhas Inscricoes"
        description="Historico de inscricoes e pagamentos"
      />

      {submissions.length === 0 ? (
        <PortalEmptyState
          title="Sem Inscricoes"
          description="Suas inscricoes aparecerao aqui quando voce se candidatar."
          icon={<FileText className="h-8 w-8" />}
        />
      ) : (
        <div className="space-y-5">
          {submissions.map((sub) => (
            <SubmissionCard
              key={sub.id}
              submission={sub}
              plans={state.plans}
              language={i18n.language}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Submission Card ─── */

function SubmissionCard({
  submission,
  plans,
  language,
}: {
  submission: ClientSubmissionItem;
  plans: PlanTemplate[];
  language: string;
}) {
  const subStatus = getSubmissionStatusMeta(
    submission.status as Parameters<typeof getSubmissionStatusMeta>[0],
    language,
  );
  const payStatus = getPaymentStatusMeta(
    submission.paymentStatus as Parameters<typeof getPaymentStatusMeta>[0],
    language,
  );

  let planName = "-";
  try {
    planName = getPlanById(plans, submission.planId).name;
  } catch {
    planName = submission.planId;
  }

  const isPending = submission.paymentStatus === "pending";
  const hasCheckoutUrl = !!submission.payment?.checkoutUrl;

  return (
    <PortalSurface padding="none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.05] px-5 py-4">
        <div className="flex items-center gap-3">
          <FileText className="h-4 w-4 text-slate-400 dark:text-white/35" />
          <span className="text-sm font-semibold text-slate-950 dark:text-white">
            {submission.submissionCode}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <PortalStatusPill tone={subStatus.tone}>
            {subStatus.label}
          </PortalStatusPill>
          <PortalStatusPill tone={payStatus.tone}>
            {payStatus.label}
          </PortalStatusPill>
        </div>
      </div>

      {/* Info grid */}
      <div className="px-5 py-4">
        <PortalMetricList
          columns={2}
          items={[
            {
              label: "Plano",
              value: planName,
            },
            {
              label: "Enviado em",
              value: formatPropDate(submission.submittedAt, language, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
            },
            {
              label: "Email",
              value: submission.email,
            },
            {
              label: "Telefone",
              value: submission.phone || "-",
            },
            {
              label: "Cidade",
              value: [submission.city, submission.country]
                .filter(Boolean)
                .join(", ") || "-",
            },
            {
              label: "Pagamento",
              value: payStatus.label,
              hint: submission.paidAt
                ? `Pago em ${formatPropDate(submission.paidAt, language, {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}`
                : undefined,
            },
          ]}
        />
      </div>

      {/* Payment details */}
      {submission.payment ? (
        <div className="border-t border-slate-100 dark:border-white/[0.05] px-5 py-4">
          <div className="mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-slate-400 dark:text-white/35" />
            <span className="text-xs font-semibold text-slate-950 dark:text-white">
              Detalhes do pagamento
            </span>
          </div>
          <PortalMetricList
            columns={2}
            items={[
              {
                label: "Codigo",
                value: submission.payment.paymentCode,
              },
              {
                label: "Valor",
                value:
                  submission.payment.amount != null
                    ? `${submission.payment.amount.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })} ${submission.payment.currency ?? ""}`
                    : "-",
              },
              {
                label: "Status",
                value: getPaymentStatusMeta(
                  submission.payment.status as Parameters<
                    typeof getPaymentStatusMeta
                  >[0],
                  language,
                ).label,
              },
              {
                label: "Datas",
                value: submission.payment.approvedAt
                  ? `Aprovado ${formatPropDate(
                      submission.payment.approvedAt,
                      language,
                      { day: "2-digit", month: "2-digit", year: "numeric" },
                    )}`
                  : submission.payment.dueAt
                    ? `Vence ${formatPropDate(submission.payment.dueAt, language, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}`
                    : "-",
              },
            ]}
          />

          {isPending && hasCheckoutUrl ? (
            <div className="mt-4">
              <a
                href={submission.payment.checkoutUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                <ExternalLink className="h-4 w-4" />
                Ir para pagamento
              </a>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Status timeline */}
      <div className="border-t border-slate-100 dark:border-white/[0.05] px-5 py-4">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400 dark:text-white/35" />
          <span className="text-xs font-semibold text-slate-950 dark:text-white">
            Linha do tempo
          </span>
        </div>
        <div className="space-y-0">
          <TimelineStep
            icon={<FileText className="h-3.5 w-3.5" />}
            label="Inscricao enviada"
            date={submission.submittedAt}
            language={language}
            completed
          />
          <TimelineStep
            icon={<CreditCard className="h-3.5 w-3.5" />}
            label="Pagamento aprovado"
            date={submission.paidAt}
            language={language}
            completed={!!submission.paidAt}
          />
          <TimelineStep
            icon={<Clock className="h-3.5 w-3.5" />}
            label="Em analise"
            date={submission.reviewedAt}
            language={language}
            completed={!!submission.reviewedAt}
          />
          <TimelineStep
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            label={`Status atual: ${
              getSubmissionStatusMeta(
                submission.status as Parameters<
                  typeof getSubmissionStatusMeta
                >[0],
                language,
              ).label
            }`}
            completed={
              submission.status === "access_ready" ||
              submission.status === "account_ready"
            }
            isLast
          />
        </div>
      </div>
    </PortalSurface>
  );
}

/* ─── Timeline Step ─── */

function TimelineStep({
  icon,
  label,
  date,
  language,
  completed = false,
  isLast = false,
}: {
  icon: React.ReactNode;
  label: string;
  date?: string | null;
  language?: string;
  completed?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-3">
      {/* Vertical line + dot */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
            completed
              ? "bg-emerald-100 text-emerald-600"
              : "bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-white/35"
          }`}
        >
          {icon}
        </div>
        {!isLast ? (
          <div
            className={`w-px flex-1 ${
              completed ? "bg-emerald-200" : "bg-slate-200 dark:bg-white/[0.1]"
            }`}
            style={{ minHeight: 20 }}
          />
        ) : null}
      </div>

      {/* Content */}
      <div className="pb-4">
        <p
          className={`text-sm font-medium ${
            completed ? "text-slate-950 dark:text-white" : "text-slate-400 dark:text-white/35"
          }`}
        >
          {label}
        </p>
        {date ? (
          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-white/35">
            {formatPropDate(date, language, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        ) : null}
      </div>
    </div>
  );
}
