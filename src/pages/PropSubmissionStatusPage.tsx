import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Reveal } from "../components/Reveal";
import { cn } from "../lib/utils";
import { fetchSubmissionByCodeApi, revealSubmissionCredentialsApi } from "../modules/prop-system/api";
import { normalizeAppLanguage } from "../lib/language";
import { statusToLabel } from "../modules/prop-system/rules";
import type { PublicSubmissionBundle, SubmissionCredentials, SubmissionStatus } from "../modules/prop-system/types";

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
    badge: "Acompanhamento da Inscrição",
    loading: "Carregando sua inscrição...",
    notFound: "Não encontramos essa inscrição. Verifique o código recebido no e-mail.",
    title: "Status da sua inscrição Prop",
    subtitle: "A partir desta página você acompanha pagamento, revisão, ativação do acesso e entrega da conta.",
    submissionCode: "Código da inscrição",
    paymentCard: "Status do pagamento do teste",
    paymentPending: "Pagamento pendente",
    paymentOverdue: "Pagamento em atraso",
    paymentApproved: "Pagamento aprovado",
    paymentHint: "Use sempre este código em qualquer contato com o time Everwin.",
    openCheckout: "Pagar agora",
    waitingCheckout: "Seu checkout está sendo preparado pelo time. O status será atualizado aqui e por e-mail.",
    waitlistTitle: "Candidatura em análise",
    waitlistDesc: "Sua candidatura foi recebida e está sendo analisada pela nossa equipe. Você receberá um e-mail com o link de pagamento assim que for aprovada.",
    waitlistHint: "Guarde o código abaixo para acompanhar o andamento.",
    accessReady: "Seu acesso Everwin já está liberado",
    accessReadyDesc: "Seu login foi provisionado. Use o portal para entrar na operação e acompanhar as contas vinculadas.",
    goLogin: "Ir para o login",
    summary: "Resumo da candidatura",
    timeline: "Linha do tempo",
    plan: "Plano",
    amount: "Valor",
    email: "E-mail principal",
    phone: "Telefone",
    cpf: "Documento",
    submittedAt: "Enviado em",
    paidAt: "Pagamento confirmado em",
    reviewAt: "Revisado em",
    currentStatus: "Status atual",
    accountArea: "Contas vinculadas",
    noAccounts: "Sua conta operacional ainda não foi vinculada. Assim que isso ocorrer, você receberá um e-mail com os dados.",
    accountId: "Account ID",
    platformLogin: "Login da plataforma",
    portalLogin: "Login do portal",
    accountStatus: "Status da conta",
    status: "Status",
    legal: "Atenção: submissões duplicadas não geram nova compra. Se você já possui esse código, continue acompanhando por aqui.",
    retry: "Tentar novamente",
    showData: "Mostrar dados pessoais",
    hideData: "Ocultar dados pessoais",
    revealTitle: "Ver meus dados e a senha do portal",
    revealDesc: "Seus dados aparecem ocultos porque esta página abre por link. Confirme o e-mail usado na inscrição para liberá-los.",
    revealPlaceholder: "E-mail usado na inscrição",
    revealAction: "Liberar dados",
    revealBusy: "Verificando...",
    revealCancel: "Cancelar",
    credentialsTitle: "Dados de acesso ao portal",
    credentialsHint: "Guarde estes dados. Você pode alterar a senha depois de entrar.",
    fieldPortal: "Portal",
    fieldEmail: "E-mail",
    fieldPassword: "Senha",
    copy: "Copiar",
    copied: "Copiado",
    revealClosed: "Os dados de acesso já foram entregues. Use \"Esqueci minha senha\" na tela de login.",
    passwordChanged: "Você já definiu uma senha própria. Se esqueceu, use \"Esqueci minha senha\" na tela de login.",
    passwordUnavailable: "A senha não está disponível aqui. Use \"Esqueci minha senha\" na tela de login.",
  },
  en: {
    badge: "Submission Tracking",
    loading: "Loading your submission...",
    notFound: "We could not find this submission. Please check the code sent by email.",
    title: "Your Prop submission status",
    subtitle: "Use this page to track payment, review, access activation, and account delivery.",
    submissionCode: "Submission code",
    paymentCard: "Test payment status",
    paymentPending: "Payment pending",
    paymentOverdue: "Payment overdue",
    paymentApproved: "Payment approved",
    paymentHint: "Always use this code in any contact with the Everwin team.",
    openCheckout: "Pay now",
    waitingCheckout: "Your checkout is being prepared by the team. The status will be updated here and by email.",
    waitlistTitle: "Application under review",
    waitlistDesc: "Your application has been received and is being reviewed by our team. You will receive an email with the payment link once it is approved.",
    waitlistHint: "Save the code below to track your application.",
    accessReady: "Your Everwin access is now active",
    accessReadyDesc: "Your login has been provisioned. Use the portal to enter operations and monitor linked accounts.",
    goLogin: "Go to login",
    summary: "Application summary",
    timeline: "Timeline",
    plan: "Plan",
    amount: "Amount",
    email: "Primary email",
    phone: "Phone",
    cpf: "Document",
    submittedAt: "Submitted at",
    paidAt: "Payment confirmed at",
    reviewAt: "Reviewed at",
    currentStatus: "Current status",
    accountArea: "Linked accounts",
    noAccounts: "Your operational account has not been linked yet. As soon as it happens, you will receive an email with the data.",
    accountId: "Account ID",
    platformLogin: "Platform login",
    portalLogin: "Portal login",
    accountStatus: "Account status",
    status: "Status",
    legal: "Important: duplicate submissions do not create a new purchase. If you already have this code, keep tracking from here.",
    retry: "Try again",
    showData: "Show personal data",
    hideData: "Hide personal data",
    revealTitle: "Show my data and portal password",
    revealDesc: "Your data is hidden because this page opens from a link. Confirm the email used on the application to unlock it.",
    revealPlaceholder: "Email used on the application",
    revealAction: "Unlock data",
    revealBusy: "Checking...",
    revealCancel: "Cancel",
    credentialsTitle: "Portal access details",
    credentialsHint: "Keep these safe. You can change the password after signing in.",
    fieldPortal: "Portal",
    fieldEmail: "Email",
    fieldPassword: "Password",
    copy: "Copy",
    copied: "Copied",
    revealClosed: "The access details were already delivered. Use \"Forgot password\" on the login screen.",
    passwordChanged: "You already set your own password. If you forgot it, use \"Forgot password\" on the login screen.",
    passwordUnavailable: "The password is not available here. Use \"Forgot password\" on the login screen.",
  },
  es: {
    badge: "Seguimiento de Solicitud",
    loading: "Cargando su solicitud...",
    notFound: "No encontramos esta solicitud. Verifique el código recibido por e-mail.",
    title: "Estado de su solicitud Prop",
    subtitle: "Desde esta página puede acompañar pago, revisión, activación del acceso y entrega de la cuenta.",
    submissionCode: "Código de solicitud",
    paymentCard: "Estado del pago del test",
    paymentPending: "Pago pendiente",
    paymentOverdue: "Pago vencido",
    paymentApproved: "Pago aprobado",
    paymentHint: "Use siempre este código en cualquier contacto con el equipo Everwin.",
    openCheckout: "Pagar ahora",
    waitingCheckout: "Su checkout está siendo preparado por el equipo. El estado se actualizará aquí y por e-mail.",
    waitlistTitle: "Solicitud en análisis",
    waitlistDesc: "Su solicitud fue recibida y está siendo analizada por nuestro equipo. Recibirá un e-mail con el enlace de pago cuando sea aprobada.",
    waitlistHint: "Guarde el código a continuación para dar seguimiento.",
    accessReady: "Su acceso Everwin ya está liberado",
    accessReadyDesc: "Su login ya fue provisionado. Use el portal para entrar a la operación y monitorear las cuentas vinculadas.",
    goLogin: "Ir al login",
    summary: "Resumen de la candidatura",
    timeline: "Línea de tiempo",
    plan: "Plan",
    amount: "Valor",
    email: "E-mail principal",
    phone: "Teléfono",
    cpf: "Documento",
    submittedAt: "Enviado en",
    paidAt: "Pago confirmado en",
    reviewAt: "Revisado en",
    currentStatus: "Estado actual",
    accountArea: "Cuentas vinculadas",
    noAccounts: "Su cuenta operativa todavía no fue vinculada. En cuanto ocurra, recibirá un e-mail con los datos.",
    accountId: "Account ID",
    platformLogin: "Login de plataforma",
    portalLogin: "Login del portal",
    accountStatus: "Estado de la cuenta",
    status: "Estado",
    legal: "Importante: las solicitudes duplicadas no generan una nueva compra. Si ya tiene este código, continúe el seguimiento desde aquí.",
    retry: "Intentar nuevamente",
    showData: "Mostrar datos personales",
    hideData: "Ocultar datos personales",
    revealTitle: "Ver mis datos y la contraseña del portal",
    revealDesc: "Tus datos aparecen ocultos porque esta página se abre por enlace. Confirma el correo usado en la inscripción para liberarlos.",
    revealPlaceholder: "Correo usado en la inscripción",
    revealAction: "Liberar datos",
    revealBusy: "Verificando...",
    revealCancel: "Cancelar",
    credentialsTitle: "Datos de acceso al portal",
    credentialsHint: "Guarda estos datos. Puedes cambiar la contraseña después de entrar.",
    fieldPortal: "Portal",
    fieldEmail: "Correo",
    fieldPassword: "Contraseña",
    copy: "Copiar",
    copied: "Copiado",
    revealClosed: "Los datos de acceso ya fueron entregados. Usa \"Olvidé mi contraseña\" en la pantalla de inicio de sesión.",
    passwordChanged: "Ya definiste tu propia contraseña. Si la olvidaste, usa \"Olvidé mi contraseña\" en la pantalla de inicio de sesión.",
    passwordUnavailable: "La contraseña no está disponible aquí. Usa \"Olvidé mi contraseña\" en la pantalla de inicio de sesión.",
  },
} as const;

function submissionStatusLabel(status: SubmissionStatus, language: "pt" | "en" | "es") {
  const map: Record<"pt" | "en" | "es", Record<SubmissionStatus, string>> = {
    pt: {
      submitted: "Enviada",
      payment_pending: "Pagamento pendente",
      payment_overdue: "Pagamento vencido",
      payment_approved: "Pagamento aprovado",
      under_review: "Em revisão",
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
      under_review: "En revisión",
      access_ready: "Acceso listo",
      account_ready: "Cuenta lista",
      rejected: "Rechazada",
      cancelled: "Cancelada",
    },
  };

  return map[language][status];
}

export default function PropSubmissionStatusPage() {
  const [params] = useSearchParams();
  const { i18n } = useTranslation();
  const lang = normalizeAppLanguage(i18n.resolvedLanguage ?? i18n.language);
  const copy = COPY[lang];
  const [bundle, setBundle] = useState<PublicSubmissionBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The submission code travels in a URL and is guessable, so the server sends
  // this page nothing but masked contact data. Confirming the application email
  // is the applicant's proof of ownership — and the only way to see the rest.
  const [credentials, setCredentials] = useState<SubmissionCredentials | null>(null);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [challengeEmail, setChallengeEmail] = useState("");
  const [challengeBusy, setChallengeBusy] = useState(false);
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const revealed = credentials !== null;

  const code = params.get("id") ?? "";
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBundle = useCallback(async (isInitial: boolean) => {
    if (!code) {
      setLoading(false);
      setError(copy.notFound);
      return;
    }
    if (isInitial) { setLoading(true); setError(null); }
    try {
      const response = await fetchSubmissionByCodeApi(code);
      setBundle(response);
      setError(null);
    } catch (err) {
      if (isInitial) setError(err instanceof Error ? err.message : copy.notFound);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [code, copy.notFound]);

  useEffect(() => {
    void fetchBundle(true);
    intervalRef.current = setInterval(() => void fetchBundle(false), 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchBundle]);

  const submitChallenge = useCallback(async () => {
    const email = challengeEmail.trim();
    if (!email) return;
    setChallengeBusy(true);
    setChallengeError(null);
    try {
      const result = await revealSubmissionCredentialsApi(code, email);
      setCredentials(result);
      setChallengeOpen(false);
      setChallengeEmail("");
    } catch (err) {
      setChallengeError(err instanceof Error ? err.message : copy.notFound);
    } finally {
      setChallengeBusy(false);
    }
  }, [challengeEmail, code, copy.notFound]);

  const hideData = useCallback(() => {
    setCredentials(null);
    setChallengeOpen(false);
    setChallengeError(null);
  }, []);

  const timelineItems = useMemo(() => {
    if (!bundle) return [];
    return [
      { label: copy.submittedAt, value: formatDate(bundle.application.submittedAt, i18n.language) },
      { label: copy.paidAt, value: formatDate(bundle.application.paidAt, i18n.language) },
      { label: copy.reviewAt, value: formatDate(bundle.application.reviewedAt, i18n.language) },
      { label: copy.currentStatus, value: submissionStatusLabel(bundle.application.status, lang) },
    ].filter((item) => item.value && item.value !== "-");
  }, [bundle, copy, i18n.language, lang]);

  const hasCheckoutLink = Boolean(bundle?.payment?.checkoutUrl);
  const portalUrl = credentials?.loginUrl ?? bundle?.loginUrl ?? `${window.location.origin}/prop/login`;
  // The page is public by design; the credentials are not. Once delivered, the
  // challenge disappears entirely — typing the right email no longer helps.
  const canReveal = bundle?.credentialsRevealAvailable !== false;

  return (
    <div className="min-h-screen bg-[linear-gradient(187deg,rgb(246,247,249)_-24%,rgb(224,227,235)_100%)] px-4 pb-24 pt-[120px] md:pt-[150px]">
      <div className="pointer-events-none fixed inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(15,23,42,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.08) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative z-[1] mx-auto max-w-[1120px]">
        <Reveal>
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-bricolage_grotesque text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">{copy.badge}</span>
            </div>
            <h1 className="mt-4 font-bricolage_grotesque text-[36px] font-bold leading-[1.04] tracking-[-0.03em] text-gray-800 md:text-[58px]">
              {copy.title}
            </h1>
            <p className="mx-auto mt-3 max-w-[760px] font-bricolage_grotesque text-base leading-7 text-gray-500">
              {copy.subtitle}
            </p>
          </div>
        </Reveal>

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-[0_26px_70px_-54px_rgba(15,23,42,0.45)]">
            <p className="font-bricolage_grotesque text-base text-slate-600">{copy.loading}</p>
          </div>
        ) : error || !bundle ? (
          <div className="rounded-[28px] border border-red-200 bg-white p-10 text-center shadow-[0_26px_70px_-54px_rgba(15,23,42,0.45)]">
            <p className="font-bricolage_grotesque text-base text-red-600">{error ?? copy.notFound}</p>
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
            <div className="space-y-6">
              <Reveal delay={60}>
                <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_26px_70px_-54px_rgba(15,23,42,0.45)]">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-bricolage_grotesque text-xs uppercase tracking-[0.16em] text-slate-500">{copy.submissionCode}</p>
                      <p className="mt-2 font-bricolage_grotesque text-2xl font-bold text-slate-900">{bundle.application.submissionCode}</p>
                    </div>
                    <div className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 font-bricolage_grotesque text-sm font-semibold text-emerald-700">
                      {bundle.application.fullName}
                    </div>
                  </div>

                  <ProgressStepper status={bundle.application.status} language={lang} />

                  {bundle.application.status === "submitted" ? (
                    <div className="mt-6 rounded-xl border border-amber-400/25 bg-[linear-gradient(180deg,rgba(234,179,8,0.14)_0%,rgba(234,179,8,0.06)_100%)] p-5">
                      <p className="font-bricolage_grotesque text-xs uppercase tracking-[0.14em] text-amber-700">{copy.waitlistTitle}</p>
                      <p className="mt-2 font-bricolage_grotesque text-lg font-bold text-slate-900">{copy.waitlistDesc}</p>
                      <p className="mt-3 font-bricolage_grotesque text-sm leading-6 text-slate-600">{copy.waitlistHint}</p>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-xl border border-emerald-500/20 bg-[linear-gradient(180deg,rgba(16,185,129,0.14)_0%,rgba(16,185,129,0.06)_100%)] p-5">
                      <p className="font-bricolage_grotesque text-xs uppercase tracking-[0.14em] text-emerald-700">{copy.paymentCard}</p>
                      <p className="mt-2 font-bricolage_grotesque text-2xl font-bold text-slate-900">
                        {bundle.application.paymentStatus === "approved"
                          ? copy.paymentApproved
                          : bundle.application.paymentStatus === "overdue"
                            ? copy.paymentOverdue
                            : copy.paymentPending}
                      </p>
                      <p className="mt-2 font-bricolage_grotesque text-sm leading-6 text-slate-600">{copy.paymentHint}</p>

                      <div className="mt-5 rounded-2xl border border-white/40 bg-white/70 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-bricolage_grotesque text-sm text-slate-500">{copy.amount}</p>
                            <p className="mt-1 font-bricolage_grotesque text-xl font-bold text-slate-900">
                              {formatMoney(bundle.payment?.amount ?? bundle.application.amount, bundle.payment?.currency ?? bundle.application.currency, i18n.language)}
                            </p>
                          </div>
                          {hasCheckoutLink && bundle?.payment?.checkoutUrl && bundle.application.paymentStatus !== "approved" ? (
                            <a
                              href={bundle.payment?.checkoutUrl ?? "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center rounded-2xl bg-emerald-500 px-5 py-3 font-bricolage_grotesque text-sm font-semibold text-slate-950"
                            >
                              {copy.openCheckout}
                            </a>
                          ) : null}
                        </div>
                        {bundle.application.paymentStatus !== "approved" && !hasCheckoutLink ? (
                          <p className="mt-4 font-bricolage_grotesque text-sm leading-6 text-slate-600">
                            {bundle.vacanciesLocked ? bundle.vacanciesMessage || copy.waitingCheckout : copy.waitingCheckout}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {bundle.canAccessPortal ? (
                    <div className="mt-6 rounded-xl border border-sky-400/20 bg-sky-50 p-5">
                      <p className="font-bricolage_grotesque text-xl font-bold text-slate-900">{copy.accessReady}</p>
                      <p className="mt-2 font-bricolage_grotesque text-sm leading-6 text-slate-600">{copy.accessReadyDesc}</p>
                      {credentials ? (
                        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            <p className="font-bricolage_grotesque text-sm font-bold text-slate-900">
                              {copy.credentialsTitle}
                            </p>
                          </div>

                          <div className="mt-4 space-y-2">
                            <CredentialRow label={copy.fieldPortal} value={portalUrl} copyLabel={copy.copy} copiedLabel={copy.copied} />
                            <CredentialRow
                              label={copy.fieldEmail}
                              value={credentials.portalLogin ?? credentials.email}
                              copyLabel={copy.copy}
                              copiedLabel={copy.copied}
                            />
                            {credentials.portalPassword ? (
                              <CredentialRow
                                label={copy.fieldPassword}
                                value={credentials.portalPassword}
                                mono
                                copyLabel={copy.copy}
                                copiedLabel={copy.copied}
                              />
                            ) : (
                              <p className="rounded-lg bg-amber-50 px-3 py-2 font-bricolage_grotesque text-xs leading-5 text-amber-800">
                                {credentials.passwordState === "changed_by_user"
                                  ? copy.passwordChanged
                                  : copy.passwordUnavailable}
                              </p>
                            )}
                          </div>

                          <p className="mt-3 font-bricolage_grotesque text-xs leading-5 text-slate-500">
                            {copy.credentialsHint}
                          </p>
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <Link
                          to="/prop/login"
                          className="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 font-bricolage_grotesque text-sm font-semibold text-white"
                        >
                          {copy.goLogin}
                        </Link>
                        {!credentials && canReveal ? (
                          <button
                            type="button"
                            onClick={() => setChallengeOpen(true)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-5 py-3 font-bricolage_grotesque text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                          >
                            <Eye className="h-4 w-4" />
                            {copy.revealTitle}
                          </button>
                        ) : null}
                        {!credentials && !canReveal ? (
                          <span className="font-bricolage_grotesque text-sm text-slate-500">{copy.revealClosed}</span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </section>
              </Reveal>

              <Reveal delay={120}>
                <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_26px_70px_-54px_rgba(15,23,42,0.45)]">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="font-bricolage_grotesque text-2xl font-bold text-slate-900">{copy.accountArea}</h2>
                  </div>
                  {bundle.accounts.length === 0 ? (
                    <p className="font-bricolage_grotesque text-sm leading-6 text-slate-600">{copy.noAccounts}</p>
                  ) : (
                    <div className="space-y-4">
                      {bundle.accounts.map((account) => (
                        <div key={account.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div>
                              <p className="font-bricolage_grotesque text-xs uppercase tracking-[0.12em] text-slate-500">{copy.accountId}</p>
                              <p
                                className={cn(
                                  "mt-1 font-bricolage_grotesque text-sm font-semibold text-slate-900 transition-all duration-200",
                                  !revealed && "select-none blur-[5px]",
                                )}
                              >
                                {account.accountId}
                              </p>
                            </div>
                            <div>
                              <p className="font-bricolage_grotesque text-xs uppercase tracking-[0.12em] text-slate-500">{copy.platformLogin}</p>
                              <p className="mt-1 font-bricolage_grotesque text-sm font-semibold text-slate-900">{account.platformLogin}</p>
                            </div>
                            <div>
                              <p className="font-bricolage_grotesque text-xs uppercase tracking-[0.12em] text-slate-500">{copy.accountStatus}</p>
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

            <div className="space-y-6">
              <Reveal delay={90}>
                <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_26px_70px_-54px_rgba(15,23,42,0.45)]">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-bricolage_grotesque text-2xl font-bold text-slate-900">{copy.summary}</h2>
                    {revealed || canReveal ? (
                      <button
                        type="button"
                        onClick={() => (revealed ? hideData() : setChallengeOpen((open) => !open))}
                        aria-pressed={revealed}
                        title={revealed ? copy.hideData : copy.showData}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-slate-300 hover:text-slate-700"
                      >
                        {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{revealed ? copy.hideData : copy.showData}</span>
                      </button>
                    ) : null}
                  </div>

                  {challengeOpen && !revealed && canReveal ? (
                    <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-bricolage_grotesque text-xs leading-5 text-slate-600">{copy.revealDesc}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <input
                          type="email"
                          value={challengeEmail}
                          onChange={(event) => setChallengeEmail(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") void submitChallenge();
                          }}
                          placeholder={copy.revealPlaceholder}
                          autoComplete="email"
                          className="h-10 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 font-bricolage_grotesque text-sm text-slate-900 outline-none transition focus:border-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => void submitChallenge()}
                          disabled={challengeBusy || !challengeEmail.trim()}
                          className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 font-bricolage_grotesque text-sm font-semibold text-white transition disabled:opacity-40"
                        >
                          {challengeBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          {challengeBusy ? copy.revealBusy : copy.revealAction}
                        </button>
                      </div>
                      {challengeError ? (
                        <p className="mt-2 font-bricolage_grotesque text-xs text-red-600">{challengeError}</p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-5 space-y-4 font-bricolage_grotesque text-sm text-slate-700">
                    <SummaryRow label={copy.plan} value={bundle.plan?.name ?? bundle.application.planId} />
                    <SummaryRow label={copy.amount} value={formatMoney(bundle.application.amount, bundle.application.currency, i18n.language)} />
                    <SummaryRow label={copy.email} value={credentials?.email ?? bundle.application.email} />
                    <SummaryRow label={copy.phone} value={credentials?.phone ?? bundle.application.phone} />
                    <SummaryRow
                      label={bundle.application.documentType ?? copy.cpf}
                      value={
                        credentials?.document ??
                        bundle.application.documentNumber ??
                        bundle.application.cpf ??
                        "-"
                      }
                    />
                    <SummaryRow label={copy.submittedAt} value={formatDate(bundle.application.submittedAt, i18n.language)} />
                  </div>
                </section>
              </Reveal>

              <Reveal delay={140}>
                <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_26px_70px_-54px_rgba(15,23,42,0.45)]">
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

              <Reveal delay={180}>
                <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_26px_70px_-54px_rgba(15,23,42,0.45)]">
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

const STEP_LABELS: Record<"pt" | "en" | "es", string[]> = {
  pt: ["Candidatura", "Pagamento", "Revisão", "Acesso", "Conta"],
  en: ["Application", "Payment", "Review", "Access", "Account"],
  es: ["Solicitud", "Pago", "Revisión", "Acceso", "Cuenta"],
};

function statusToStep(status: SubmissionStatus): number {
  switch (status) {
    case "submitted": return 0;
    case "payment_pending": case "payment_overdue": return 1;
    case "payment_approved": case "under_review": return 2;
    case "access_ready": return 3;
    case "account_ready": return 4;
    case "rejected": case "cancelled": return -1;
    default: return 0;
  }
}

function ProgressStepper({ status, language }: { status: SubmissionStatus; language: "pt" | "en" | "es" }) {
  const labels = STEP_LABELS[language];
  const activeStep = statusToStep(status);
  const isTerminal = activeStep === -1;

  return (
    <div className="mt-6 flex items-center gap-1">
      {labels.map((label, i) => {
        const done = !isTerminal && i < activeStep;
        const current = !isTerminal && i === activeStep;
        return (
          <div key={label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              {i > 0 && <div className={`h-0.5 flex-1 ${done ? "bg-emerald-500" : "bg-slate-200"}`} />}
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? "bg-emerald-500 text-white"
                    : current
                      ? "border-2 border-emerald-500 bg-white text-emerald-600"
                      : isTerminal
                        ? "border border-red-300 bg-red-50 text-red-400"
                        : "border border-slate-200 bg-slate-50 text-slate-400"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              {i < labels.length - 1 && <div className={`h-0.5 flex-1 ${done && i + 1 < activeStep ? "bg-emerald-500" : "bg-slate-200"}`} />}
            </div>
            <span className={`text-center font-bricolage_grotesque text-[10px] font-semibold uppercase tracking-[0.08em] ${
              done ? "text-emerald-600" : current ? "text-emerald-600" : "text-slate-400"
            }`}>
              {label}
            </span>
          </div>
        );
      })}
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

/** One credential, readable and copyable — the whole point of the reveal. */
function CredentialRow({
  label,
  value,
  mono,
  copyLabel,
  copiedLabel,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard is blocked in some embedded browsers; the value is on screen.
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <span className="w-16 shrink-0 font-bricolage_grotesque text-[11px] uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 select-all truncate text-sm font-semibold text-slate-900",
          mono ? "font-mono" : "font-bricolage_grotesque",
        )}
        title={value}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => void handleCopy()}
        title={copied ? copiedLabel : copyLabel}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-700"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
        <span className="sr-only">{copied ? copiedLabel : copyLabel}</span>
      </button>
    </div>
  );
}
