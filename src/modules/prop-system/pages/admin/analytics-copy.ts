import type { PaymentStatus, SubmissionStatus } from "../../types";

export type CopyLang = "pt" | "en" | "es";
export type RangePreset = "7d" | "30d" | "90d" | "all" | "custom";
export type PaymentFilter = "all" | "approved" | "open" | "overdue" | "failed" | "cancelled";
export type StatusFilter = "all" | SubmissionStatus;

export type AnalyticsCopy = {
  title: string;
  description: string;
  refresh: string;
  loading: string;
  loadError: string;
  filtersTitle: string;
  filtersDescription: string;
  range: string;
  from: string;
  to: string;
  status: string;
  payment: string;
  plan: string;
  locale: string;
  currency: string;
  search: string;
  searchPlaceholder: string;
  fx: string;
  fxHelper: string;
  presets: Record<RangePreset, string>;
  paymentOptions: Record<PaymentFilter, string>;
  statusOptions: Record<StatusFilter, string>;
  localeOptions: { all: string; pt: string; en: string; es: string };
  currencyOptions: { all: string; BRL: string; USD: string };
  planAll: string;
  kpis: {
    submissions: string;
    sales: string;
    conversion: string;
    realizedRevenue: string;
    pipelineRevenue: string;
    averageTicket: string;
  };
  helpers: {
    submissions: string;
    sales: string;
    conversion: string;
    realizedRevenue: string;
    pipelineRevenue: string;
    averageTicket: string;
  };
  charts: {
    submissions: string;
    submissionsSubtitle: string;
    approvedRevenue: string;
    approvedRevenueSubtitle: string;
    paymentMix: string;
    planMix: string;
  };
  table: {
    title: string;
    subtitle: string;
    day: string;
    submissions: string;
    sales: string;
    conversion: string;
    submittedValue: string;
    approvedValue: string;
    pendingValue: string;
    empty: string;
  };
  noData: string;
};

export const analyticsCopy: Record<CopyLang, AnalyticsCopy> = {
  pt: {
    title: "Analytics",
    description: "Volume • Revenue • Pipeline",
    refresh: "Atualizar",
    loading: "Carregando...",
    loadError: "Falha ao carregar.",
    filtersTitle: "Filters",
    filtersDescription: "Period, status, plan, currency, locale, and FX rate.",
    range: "Range",
    from: "From",
    to: "To",
    status: "Status",
    payment: "Payment",
    plan: "Plan",
    locale: "Locale",
    currency: "Currency",
    search: "Search",
    searchPlaceholder: "Name, email, code, phone, or document",
    fx: "USD → BRL",
    fxHelper: "BRL plans are exact. USD plans use this rate.",
    presets: {
      "7d": "7 days",
      "30d": "30 days",
      "90d": "90 days",
      all: "All",
      custom: "Custom",
    },
    paymentOptions: {
      all: "All",
      approved: "Approved",
      open: "Open",
      overdue: "Overdue",
      failed: "Failed",
      cancelled: "Cancelled",
    },
    statusOptions: {
      all: "All",
      submitted: "Submitted",
      payment_pending: "Payment Pending",
      payment_overdue: "Payment Overdue",
      payment_approved: "Payment Approved",
      under_review: "Under Review",
      access_ready: "Access Ready",
      account_ready: "Account Ready",
      rejected: "Rejected",
      cancelled: "Cancelled",
    },
    localeOptions: { all: "All", pt: "PT", en: "EN", es: "ES" },
    currencyOptions: { all: "All", BRL: "BRL", USD: "USD" },
    planAll: "All Plans",
    kpis: {
      submissions: "Submissions",
      sales: "Sales",
      conversion: "Conversion",
      realizedRevenue: "Revenue (BRL)",
      pipelineRevenue: "Pipeline (BRL)",
      averageTicket: "Avg Ticket",
    },
    helpers: {
      submissions: "Total submitted in range",
      sales: "Approved payments in range",
      conversion: "Sales / Submissions",
      realizedRevenue: "Approved, consolidated BRL",
      pipelineRevenue: "Pending + Overdue",
      averageTicket: "Per approved sale",
    },
    charts: {
      submissions: "Submissions / Day",
      submissionsSubtitle: "Top of funnel",
      approvedRevenue: "Revenue / Day (BRL)",
      approvedRevenueSubtitle: "Converted at selected rate",
      paymentMix: "Payment Mix",
      planMix: "Plan Mix",
    },
    table: {
      title: "Daily Breakdown",
      subtitle: "Submissions, sales, and BRL revenue per day.",
      day: "Day",
      submissions: "Subs",
      sales: "Sales",
      conversion: "Conv",
      submittedValue: "Volume (BRL)",
      approvedValue: "Revenue (BRL)",
      pendingValue: "Pipeline",
      empty: "No results for current filters.",
    },
    noData: "No submissions found.",
  },
  en: {
    title: "Analytics",
    description: "Volume • Revenue • Pipeline",
    refresh: "Refresh",
    loading: "Loading...",
    loadError: "Failed to load.",
    filtersTitle: "Filters",
    filtersDescription: "Period, status, plan, currency, locale, and FX rate.",
    range: "Range",
    from: "From",
    to: "To",
    status: "Status",
    payment: "Payment",
    plan: "Plan",
    locale: "Locale",
    currency: "Currency",
    search: "Search",
    searchPlaceholder: "Name, email, code, phone, or document",
    fx: "USD → BRL",
    fxHelper: "BRL plans are exact. USD plans use this rate.",
    presets: {
      "7d": "7 days",
      "30d": "30 days",
      "90d": "90 days",
      all: "All",
      custom: "Custom",
    },
    paymentOptions: {
      all: "All",
      approved: "Approved",
      open: "Open",
      overdue: "Overdue",
      failed: "Failed",
      cancelled: "Cancelled",
    },
    statusOptions: {
      all: "All",
      submitted: "Submitted",
      payment_pending: "Payment Pending",
      payment_overdue: "Payment Overdue",
      payment_approved: "Payment Approved",
      under_review: "Under Review",
      access_ready: "Access Ready",
      account_ready: "Account Ready",
      rejected: "Rejected",
      cancelled: "Cancelled",
    },
    localeOptions: { all: "All", pt: "PT", en: "EN", es: "ES" },
    currencyOptions: { all: "All", BRL: "BRL", USD: "USD" },
    planAll: "All Plans",
    kpis: {
      submissions: "Submissions",
      sales: "Sales",
      conversion: "Conversion",
      realizedRevenue: "Revenue (BRL)",
      pipelineRevenue: "Pipeline (BRL)",
      averageTicket: "Avg Ticket",
    },
    helpers: {
      submissions: "Total submitted in range",
      sales: "Approved payments in range",
      conversion: "Sales / Submissions",
      realizedRevenue: "Approved, consolidated BRL",
      pipelineRevenue: "Pending + Overdue",
      averageTicket: "Per approved sale",
    },
    charts: {
      submissions: "Submissions / Day",
      submissionsSubtitle: "Top of funnel",
      approvedRevenue: "Revenue / Day (BRL)",
      approvedRevenueSubtitle: "Converted at selected rate",
      paymentMix: "Payment Mix",
      planMix: "Plan Mix",
    },
    table: {
      title: "Daily Breakdown",
      subtitle: "Submissions, sales, and BRL revenue per day.",
      day: "Day",
      submissions: "Subs",
      sales: "Sales",
      conversion: "Conv",
      submittedValue: "Volume (BRL)",
      approvedValue: "Revenue (BRL)",
      pendingValue: "Pipeline",
      empty: "No results for current filters.",
    },
    noData: "No submissions found.",
  },
  es: {
    title: "Analytics",
    description: "Volumen • Ingresos • Pipeline",
    refresh: "Actualizar",
    loading: "Cargando...",
    loadError: "Error al cargar.",
    filtersTitle: "Filtros",
    filtersDescription: "Periodo, estado, plan, moneda, idioma y tasa FX.",
    range: "Periodo",
    from: "Desde",
    to: "Hasta",
    status: "Estado",
    payment: "Pago",
    plan: "Plan",
    locale: "Idioma",
    currency: "Moneda",
    search: "Buscar",
    searchPlaceholder: "Nombre, email, codigo, telefono o documento",
    fx: "USD → BRL",
    fxHelper: "Planes BRL exactos. USD usa esta tasa.",
    presets: {
      "7d": "7 dias",
      "30d": "30 dias",
      "90d": "90 dias",
      all: "Todo",
      custom: "Custom",
    },
    paymentOptions: {
      all: "Todos",
      approved: "Aprobados",
      open: "Abiertos",
      overdue: "Vencidos",
      failed: "Fallidos",
      cancelled: "Cancelados",
    },
    statusOptions: {
      all: "Todos",
      submitted: "Enviada",
      payment_pending: "Pago Pendiente",
      payment_overdue: "Pago Vencido",
      payment_approved: "Pago Aprobado",
      under_review: "En Revision",
      access_ready: "Acceso Listo",
      account_ready: "Cuenta Lista",
      rejected: "Rechazada",
      cancelled: "Cancelada",
    },
    localeOptions: { all: "Todos", pt: "PT", en: "EN", es: "ES" },
    currencyOptions: { all: "Todas", BRL: "BRL", USD: "USD" },
    planAll: "Todos",
    kpis: {
      submissions: "Solicitudes",
      sales: "Ventas",
      conversion: "Conversion",
      realizedRevenue: "Ingresos (BRL)",
      pipelineRevenue: "Pipeline (BRL)",
      averageTicket: "Ticket Medio",
    },
    helpers: {
      submissions: "Total en rango",
      sales: "Pagos aprobados",
      conversion: "Ventas / Solicitudes",
      realizedRevenue: "Aprobado, BRL consolidado",
      pipelineRevenue: "Pendiente + Vencido",
      averageTicket: "Por venta aprobada",
    },
    charts: {
      submissions: "Solicitudes / Dia",
      submissionsSubtitle: "Top del funnel",
      approvedRevenue: "Ingresos / Dia (BRL)",
      approvedRevenueSubtitle: "Convertido a la tasa seleccionada",
      paymentMix: "Mix de Pagos",
      planMix: "Mix de Planes",
    },
    table: {
      title: "Desglose Diario",
      subtitle: "Solicitudes, ventas e ingresos BRL por dia.",
      day: "Dia",
      submissions: "Solic",
      sales: "Ventas",
      conversion: "Conv",
      submittedValue: "Volumen (BRL)",
      approvedValue: "Ingresos (BRL)",
      pendingValue: "Pipeline",
      empty: "Sin resultados para los filtros actuales.",
    },
    noData: "No se encontraron solicitudes.",
  },
};

export function getPaymentVariantLabel(status: string, language: CopyLang) {
  const map: Record<CopyLang, Record<string, string>> = {
    pt: { pending: "Pending", approved: "Approved", overdue: "Overdue", failed: "Failed", cancelled: "Cancelled" },
    en: { pending: "Pending", approved: "Approved", overdue: "Overdue", failed: "Failed", cancelled: "Cancelled" },
    es: { pending: "Pendiente", approved: "Aprobado", overdue: "Vencido", failed: "Fallido", cancelled: "Cancelado" },
  };
  return map[language]?.[status] ?? status;
}
