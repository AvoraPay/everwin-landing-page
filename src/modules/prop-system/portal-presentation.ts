import type { AccountAnalytics, AccountStatus, PaymentStatus, SubmissionStatus } from "./types";
import { currencyBRL, getPropUiLanguage, statusToLabel } from "./rules";

export type PortalTone = "neutral" | "success" | "warning" | "danger" | "info";

export function getAccountStatusMeta(status: AccountStatus, language?: string) {
  return {
    label: statusToLabel(status, language),
    tone: getAccountTone(status),
  };
}

export function getSubmissionStatusMeta(status: SubmissionStatus, language?: string) {
  const lang = getPropUiLanguage(language);

  const labels: Record<typeof lang, Record<SubmissionStatus, string>> = {
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

  return {
    label: labels[lang][status],
    tone: getSubmissionTone(status),
  };
}

export function getPaymentStatusMeta(status: PaymentStatus, language?: string) {
  const lang = getPropUiLanguage(language);

  const labels: Record<typeof lang, Record<PaymentStatus, string>> = {
    pt: {
      pending: "Pendente",
      approved: "Aprovado",
      overdue: "Vencido",
      failed: "Falhou",
      cancelled: "Cancelado",
    },
    en: {
      pending: "Pending",
      approved: "Approved",
      overdue: "Overdue",
      failed: "Failed",
      cancelled: "Cancelled",
    },
    es: {
      pending: "Pendiente",
      approved: "Aprobado",
      overdue: "Vencido",
      failed: "Fallido",
      cancelled: "Cancelado",
    },
  };

  return {
    label: labels[lang][status],
    tone: getPaymentTone(status),
  };
}

export function formatSignedCurrency(value: number, language?: string) {
  const abs = currencyBRL(Math.abs(value), language);
  if (value > 0) return `+${abs}`;
  if (value < 0) return `-${abs}`;
  return abs;
}

export function formatSignedPercent(value: number, fractionDigits = 2) {
  const formatted = `${Math.abs(value).toFixed(fractionDigits)}%`;
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

export function getSignedTone(value: number): PortalTone {
  if (value > 0) return "success";
  if (value < 0) return "danger";
  return "neutral";
}

export function getRiskTone(analytics: AccountAnalytics): PortalTone {
  if (analytics.snapshot.isHardBreach || analytics.snapshot.isDailyLimitBreached) return "danger";
  if (analytics.snapshot.remainingDrawdownBeforeBreach <= analytics.snapshot.maxAllowedLoss * 0.2) return "warning";
  return "success";
}

export function getRiskLabel(analytics: AccountAnalytics, language?: string) {
  const lang = getPropUiLanguage(language);
  if (analytics.snapshot.isHardBreach) {
    return lang === "en" ? "Hard breach" : lang === "es" ? "Incumplimiento" : "Violacao";
  }
  if (analytics.snapshot.isDailyLimitBreached) {
    return lang === "en" ? "Daily limit" : lang === "es" ? "Limite diario" : "Limite diario";
  }
  if (analytics.snapshot.remainingDrawdownBeforeBreach <= analytics.snapshot.maxAllowedLoss * 0.2) {
    return lang === "en" ? "Pressure" : lang === "es" ? "Presion" : "Pressao";
  }
  return lang === "en" ? "Healthy" : lang === "es" ? "Saudable" : "Saudavel";
}

export function getDaysRemaining(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function formatRelativeWait(date: string, language?: string) {
  const lang = getPropUiLanguage(language);
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60_000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return lang === "en" ? `${days}d waiting` : lang === "es" ? `${days}d en cola` : `${days}d em fila`;
  }
  if (hours > 0) {
    return lang === "en" ? `${hours}h waiting` : lang === "es" ? `${hours}h en cola` : `${hours}h em fila`;
  }
  return lang === "en" ? `${minutes}min waiting` : lang === "es" ? `${minutes}min en cola` : `${minutes}min em fila`;
}

function getAccountTone(status: AccountStatus): PortalTone {
  if (status === "active" || status === "approved_for_funded" || status === "passed") return "success";
  if (status === "paused" || status === "cooldown" || status === "awaiting_account_creation") return "warning";
  if (status === "failed_drawdown" || status === "failed_timeout" || status === "rejected") return "danger";
  if (status === "pending_payment") return "info";
  return "neutral";
}

function getSubmissionTone(status: SubmissionStatus): PortalTone {
  if (status === "access_ready" || status === "account_ready") return "success";
  if (status === "payment_pending" || status === "payment_overdue" || status === "under_review" || status === "payment_approved") return "warning";
  if (status === "rejected" || status === "cancelled") return "danger";
  return "info";
}

function getPaymentTone(status: PaymentStatus): PortalTone {
  if (status === "approved") return "success";
  if (status === "pending" || status === "overdue") return "warning";
  if (status === "failed" || status === "cancelled") return "danger";
  return "neutral";
}
