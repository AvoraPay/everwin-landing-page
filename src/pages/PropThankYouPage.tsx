import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Reveal } from "../components/Reveal";
import { fetchSubmissionByCodeApi } from "../modules/prop-system/api";
import { normalizeAppLanguage } from "../lib/language";
import { statusToLabel } from "../modules/prop-system/rules";
import type { PublicSubmissionBundle, SubmissionStatus } from "../modules/prop-system/types";

const STORAGE_KEY = "everwin-prop-last-submission";

function formatMoney(value: number, currency: string, language: string) {
  const locale = language.startsWith("pt") ? "pt-BR" : language.startsWith("es") ? "es-ES" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | undefined, language: string) {
  if (!value) return "-";
  const locale = language.startsWith("pt") ? "pt-BR" : language.startsWith("es") ? "es-ES" : "en-US";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

const COPY = {
  pt: {
    badge: "Compra Aprovada",
    loading: "Carregando dados da sua compra...",
    notFound: "Nao encontramos os dados dessa compra. Se voce acabou de pagar, aguarde alguns instantes e recarregue a pagina.",
    title: "Obrigado pela sua compra!",
    subtitle: "Seu pagamento foi recebido. Acompanhe abaixo o status da sua inscricao e proximos passos.",
    submissionCode: "Codigo da inscricao",
    paymentStatus: "Status do pagamento",
    paymentPending: "Processando pagamento",
    paymentApproved: "Pagamento confirmado",
    paymentOverdue: "Pagamento em atraso",
    summary: "Resumo da compra",
    plan: "Plano",
    amount: "Valor",
    email: "E-mail",
    phone: "Telefone",
    document: "Documento",
    submittedAt: "Data da inscricao",
    paidAt: "Pagamento confirmado em",
    currentStatus: "Status atual",
    nextSteps: "Proximos passos",
    nextStep1: "Nosso time vai revisar sua candidatura.",
    nextStep2: "Voce recebera por e-mail os dados de acesso a conta de avaliacao.",
    nextStep3: "Acompanhe o status desta pagina ou pelo codigo da inscricao.",
    accessReady: "Seu acesso Everwin ja esta liberado!",
    accessReadyDesc: "Seu login foi criado. Use o portal para acessar sua conta operacional.",
    goLogin: "Ir para o login",
    goTracking: "Acompanhar inscricao",
    saveCode: "Salve este codigo! Use-o em qualquer contato com o time Everwin.",
    accountArea: "Contas vinculadas",
    noAccounts: "Sua conta operacional ainda nao foi vinculada. Assim que ativarmos, voce recebera um e-mail.",
    accountId: "Account ID",
    platformLogin: "Login da plataforma",
    accountStatus: "Status da conta",
    retry: "Recarregar",
    timeline: "Linha do tempo",
    legal: "Atencao: submissoes duplicadas nao geram nova compra. Se voce ja possui esse codigo, continue acompanhando por aqui.",
  },
  en: {
    badge: "Purchase Approved",
    loading: "Loading your purchase details...",
    notFound: "We could not find your purchase data. If you just paid, wait a few moments and reload.",
    title: "Thank you for your purchase!",
    subtitle: "Your payment has been received. Track your submission status and next steps below.",
    submissionCode: "Submission code",
    paymentStatus: "Payment status",
    paymentPending: "Processing payment",
    paymentApproved: "Payment confirmed",
    paymentOverdue: "Payment overdue",
    summary: "Purchase summary",
    plan: "Plan",
    amount: "Amount",
    email: "Email",
    phone: "Phone",
    document: "Document",
    submittedAt: "Submitted at",
    paidAt: "Payment confirmed at",
    currentStatus: "Current status",
    nextSteps: "Next steps",
    nextStep1: "Our team will review your application.",
    nextStep2: "You will receive account access details by email.",
    nextStep3: "Track the status on this page or by using your submission code.",
    accessReady: "Your Everwin access is now active!",
    accessReadyDesc: "Your login has been created. Use the portal to access your operational account.",
    goLogin: "Go to login",
    goTracking: "Track submission",
    saveCode: "Save this code! Use it in any contact with the Everwin team.",
    accountArea: "Linked accounts",
    noAccounts: "Your operational account has not been linked yet. You will receive an email once it is activated.",
    accountId: "Account ID",
    platformLogin: "Platform login",
    accountStatus: "Account status",
    retry: "Reload",
    timeline: "Timeline",
    legal: "Important: duplicate submissions do not create a new purchase. If you already have this code, keep tracking from here.",
  },
  es: {
    badge: "Compra Aprobada",
    loading: "Cargando datos de su compra...",
    notFound: "No encontramos los datos de esta compra. Si acaba de pagar, espere unos instantes y recargue.",
    title: "Gracias por su compra!",
    subtitle: "Su pago fue recibido. Acompane abajo el estado de su solicitud y proximos pasos.",
    submissionCode: "Codigo de solicitud",
    paymentStatus: "Estado del pago",
    paymentPending: "Procesando pago",
    paymentApproved: "Pago confirmado",
    paymentOverdue: "Pago vencido",
    summary: "Resumen de la compra",
    plan: "Plan",
    amount: "Valor",
    email: "Correo",
    phone: "Telefono",
    document: "Documento",
    submittedAt: "Fecha de solicitud",
    paidAt: "Pago confirmado en",
    currentStatus: "Estado actual",
    nextSteps: "Proximos pasos",
    nextStep1: "Nuestro equipo revisara su candidatura.",
    nextStep2: "Recibira por correo los datos de acceso a la cuenta de evaluacion.",
    nextStep3: "Acompane el estado en esta pagina o con el codigo de solicitud.",
    accessReady: "Su acceso Everwin ya esta liberado!",
    accessReadyDesc: "Su login fue creado. Use el portal para acceder a su cuenta operativa.",
    goLogin: "Ir al login",
    goTracking: "Seguir solicitud",
    saveCode: "Guarde este codigo! Uselo en cualquier contacto con el equipo Everwin.",
    accountArea: "Cuentas vinculadas",
    noAccounts: "Su cuenta operativa aun no fue vinculada. En cuanto la activemos, recibira un correo.",
    accountId: "Account ID",
    platformLogin: "Login de plataforma",
    accountStatus: "Estado de la cuenta",
    retry: "Recargar",
    timeline: "Linea de tiempo",
    legal: "Importante: solicitudes duplicadas no generan nueva compra. Si ya tiene este codigo, continue el seguimiento desde aqui.",
  },
} as const;

function submissionStatusLabel(status: SubmissionStatus, language: "pt" | "en" | "es") {
  const map: Record<"pt" | "en" | "es", Record<SubmissionStatus, string>> = {
    pt: {
      submitted: "Enviada",
      payment_pending: "Pagamento pendente",
      payment_overdue: "Pagamento vencido",
      payment_approved: "Pagamento aprovado",
      under_review: "Em revisao",
      access_ready: "Acesso pronto",
      account_ready: "Conta pronta",
      rejected: "Rejeitada",
      cancelled: "Cancelada",
    },
    en: {
      submitted: "Submitted",
      payment_pending: "Pending payment",
      payment_overdue: "Payment overdue",
      payment_approved: "Payment approved",
      under_review: "Under review",
      access_ready: "Access ready",
      account_ready: "Account ready",
      rejected: "Rejected",
      cancelled: "Cancelled",
    },
    es: {
      submitted: "Enviada",
      payment_pending: "Pago pendiente",
      payment_overdue: "Pago vencido",
      payment_approved: "Pago aprobado",
      under_review: "En revision",
      access_ready: "Acceso listo",
      account_ready: "Cuenta lista",
      rejected: "Rechazada",
      cancelled: "Cancelada",
    },
  };
  return map[language][status];
}

export default function PropThankYouPage() {
  const [params] = useSearchParams();
  const { i18n } = useTranslation();
  const lang = normalizeAppLanguage(i18n.resolvedLanguage ?? i18n.language);
  const copy = COPY[lang];

  const [bundle, setBundle] = useState<PublicSubmissionBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resolve submission code: query param > localStorage
  const code = params.get("id") ?? localStorage.getItem(STORAGE_KEY) ?? "";

  useEffect(() => {
    if (!code) {
      setLoading(false);
      setError(copy.notFound);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    void fetchSubmissionByCodeApi(code)
      .then((response) => {
        if (!active) return;
        setBundle(response);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : copy.notFound);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [code, copy.notFound]);

  const timelineItems = useMemo(() => {
    if (!bundle) return [];
    return [
      { label: copy.submittedAt, value: formatDate(bundle.application.submittedAt, i18n.language) },
      { label: copy.paidAt, value: formatDate(bundle.application.paidAt, i18n.language) },
      { label: copy.currentStatus, value: submissionStatusLabel(bundle.application.status, lang) },
    ].filter((item) => item.value && item.value !== "-");
  }, [bundle, copy, i18n.language, lang]);

  const paymentLabel =
    bundle?.application.paymentStatus === "approved"
      ? copy.paymentApproved
      : bundle?.application.paymentStatus === "overdue"
        ? copy.paymentOverdue
        : copy.paymentPending;

  const paymentColor =
    bundle?.application.paymentStatus === "approved"
      ? "emerald"
      : bundle?.application.paymentStatus === "overdue"
        ? "amber"
        : "sky";

  return (
    <div className="min-h-screen bg-[linear-gradient(187deg,rgb(246,247,249)_-24%,rgb(224,227,235)_100%)] px-4 pb-24 pt-[112px] md:pt-[144px]">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.08) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-[1] mx-auto max-w-[1120px]">
        <Reveal>
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-bricolage_grotesque text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
                {copy.badge}
              </span>
            </div>
            <h1 className="mt-4 font-bricolage_grotesque text-[36px] font-bold leading-[1.04] tracking-[-0.03em] text-slate-900 md:text-[58px]">
              {copy.title}
            </h1>
            <p className="mx-auto mt-3 max-w-[760px] font-bricolage_grotesque text-base leading-7 text-slate-500">
              {copy.subtitle}
            </p>
          </div>
        </Reveal>

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-[0_26px_70px_-54px_rgba(15,23,42,0.45)]">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <p className="font-bricolage_grotesque text-base text-slate-600">{copy.loading}</p>
          </div>
        ) : error || !bundle ? (
          <div className="rounded-[28px] border border-amber-200 bg-white p-10 text-center shadow-[0_26px_70px_-54px_rgba(15,23,42,0.45)]">
            <p className="font-bricolage_grotesque text-base text-amber-700">{error ?? copy.notFound}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-2xl bg-slate-900 px-5 py-3 font-bricolage_grotesque text-sm font-semibold text-white"
            >
              {copy.retry}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Left column */}
            <div className="space-y-6">
              {/* Submission code + payment status */}
              <Reveal delay={60}>
                <section className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-[0_26px_70px_-54px_rgba(15,23,42,0.45)]">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-bricolage_grotesque text-xs uppercase tracking-[0.16em] text-slate-500">
                        {copy.submissionCode}
                      </p>
                      <p className="mt-2 font-bricolage_grotesque text-2xl font-bold text-slate-900">
                        {bundle.application.submissionCode}
                      </p>
                    </div>
                    <div className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 font-bricolage_grotesque text-sm font-semibold text-emerald-700">
                      {bundle.application.fullName}
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-bricolage_grotesque text-xs text-slate-500">{copy.saveCode}</p>
                  </div>

                  {/* Payment status card */}
                  <div
                    className={`mt-6 rounded-[24px] border p-5 ${
                      paymentColor === "emerald"
                        ? "border-emerald-500/20 bg-[linear-gradient(180deg,rgba(16,185,129,0.14)_0%,rgba(16,185,129,0.06)_100%)]"
                        : paymentColor === "amber"
                          ? "border-amber-400/20 bg-amber-50"
                          : "border-sky-400/20 bg-sky-50"
                    }`}
                  >
                    <p className="font-bricolage_grotesque text-xs uppercase tracking-[0.14em] text-slate-600">
                      {copy.paymentStatus}
                    </p>
                    <p className="mt-2 font-bricolage_grotesque text-2xl font-bold text-slate-900">{paymentLabel}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-bricolage_grotesque text-sm text-slate-500">{copy.amount}</p>
                        <p className="mt-1 font-bricolage_grotesque text-xl font-bold text-slate-900">
                          {formatMoney(
                            bundle.payment?.amount ?? bundle.application.amount,
                            bundle.payment?.currency ?? bundle.application.currency,
                            i18n.language,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Portal access ready */}
                  {bundle.canAccessPortal && (
                    <div className="mt-6 rounded-[24px] border border-sky-400/20 bg-sky-50 p-5">
                      <p className="font-bricolage_grotesque text-xl font-bold text-slate-900">{copy.accessReady}</p>
                      <p className="mt-2 font-bricolage_grotesque text-sm leading-6 text-slate-600">
                        {copy.accessReadyDesc}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <Link
                          to="/prop/login"
                          className="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 font-bricolage_grotesque text-sm font-semibold text-white"
                        >
                          {copy.goLogin}
                        </Link>
                        {bundle.user && (
                          <span className="font-bricolage_grotesque text-sm text-slate-600">
                            Login: <strong>{bundle.user.email}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              </Reveal>

              {/* Linked accounts */}
              <Reveal delay={120}>
                <section className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-[0_26px_70px_-54px_rgba(15,23,42,0.45)]">
                  <h2 className="mb-5 font-bricolage_grotesque text-2xl font-bold text-slate-900">
                    {copy.accountArea}
                  </h2>
                  {bundle.accounts.length === 0 ? (
                    <p className="font-bricolage_grotesque text-sm leading-6 text-slate-600">{copy.noAccounts}</p>
                  ) : (
                    <div className="space-y-4">
                      {bundle.accounts.map((account) => (
                        <div key={account.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div>
                              <p className="font-bricolage_grotesque text-xs uppercase tracking-[0.12em] text-slate-500">
                                {copy.accountId}
                              </p>
                              <p className="mt-1 font-bricolage_grotesque text-sm font-semibold text-slate-900">
                                {account.accountId}
                              </p>
                            </div>
                            <div>
                              <p className="font-bricolage_grotesque text-xs uppercase tracking-[0.12em] text-slate-500">
                                {copy.platformLogin}
                              </p>
                              <p className="mt-1 font-bricolage_grotesque text-sm font-semibold text-slate-900">
                                {account.platformLogin}
                              </p>
                            </div>
                            <div>
                              <p className="font-bricolage_grotesque text-xs uppercase tracking-[0.12em] text-slate-500">
                                {copy.accountStatus}
                              </p>
                              <p className="mt-1 font-bricolage_grotesque text-sm font-semibold text-slate-900">
                                {statusToLabel(account.status, i18n.language)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </Reveal>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Summary */}
              <Reveal delay={90}>
                <section className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-[0_26px_70px_-54px_rgba(15,23,42,0.45)]">
                  <h2 className="font-bricolage_grotesque text-2xl font-bold text-slate-900">{copy.summary}</h2>
                  <div className="mt-5 space-y-4 font-bricolage_grotesque text-sm text-slate-700">
                    <SummaryRow label={copy.plan} value={bundle.plan?.name ?? bundle.application.planId} />
                    <SummaryRow
                      label={copy.amount}
                      value={formatMoney(bundle.application.amount, bundle.application.currency, i18n.language)}
                    />
                    <SummaryRow label={copy.email} value={bundle.application.email} />
                    <SummaryRow label={copy.phone} value={bundle.application.phone} />
                    <SummaryRow
                      label={bundle.application.documentType ?? copy.document}
                      value={bundle.application.documentNumber ?? bundle.application.cpf ?? "-"}
                    />
                    <SummaryRow
                      label={copy.submittedAt}
                      value={formatDate(bundle.application.submittedAt, i18n.language)}
                    />
                  </div>
                </section>
              </Reveal>

              {/* Next steps */}
              <Reveal delay={130}>
                <section className="rounded-[30px] border border-emerald-500/15 bg-white p-7 shadow-[0_26px_70px_-54px_rgba(15,23,42,0.45)]">
                  <h2 className="font-bricolage_grotesque text-2xl font-bold text-slate-900">{copy.nextSteps}</h2>
                  <div className="mt-5 space-y-4">
                    {[copy.nextStep1, copy.nextStep2, copy.nextStep3].map((step) => (
                      <div key={step} className="flex items-start gap-3">
                        <span className="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <p className="font-bricolage_grotesque text-sm leading-6 text-slate-600">{step}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5">
                    <Link
                      to={`/prop/submission?id=${bundle.application.submissionCode}`}
                      className="inline-flex items-center rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bricolage_grotesque text-sm font-semibold text-slate-700 transition hover:border-emerald-500/30 hover:text-emerald-600"
                    >
                      {copy.goTracking}
                    </Link>
                  </div>
                </section>
              </Reveal>

              {/* Timeline */}
              <Reveal delay={160}>
                <section className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-[0_26px_70px_-54px_rgba(15,23,42,0.45)]">
                  <h2 className="font-bricolage_grotesque text-2xl font-bold text-slate-900">{copy.timeline}</h2>
                  <div className="mt-5 space-y-4">
                    {timelineItems.map((item) => (
                      <div key={item.label} className="flex items-start gap-3">
                        <span className="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <div>
                          <p className="font-bricolage_grotesque text-sm font-semibold text-slate-900">{item.label}</p>
                          <p className="font-bricolage_grotesque text-sm text-slate-600">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>

              {/* Legal */}
              <Reveal delay={190}>
                <section className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-[0_26px_70px_-54px_rgba(15,23,42,0.45)]">
                  <p className="font-bricolage_grotesque text-sm leading-6 text-slate-600">{copy.legal}</p>
                </section>
              </Reveal>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}
