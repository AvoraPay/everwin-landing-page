export type UserRole = "admin" | "client";
export type UserStatus = "active" | "blocked";
export type SubmissionStatus =
  | "submitted"
  | "payment_pending"
  | "payment_overdue"
  | "payment_approved"
  | "under_review"
  | "access_ready"
  | "account_ready"
  | "rejected"
  | "cancelled";
export type PaymentStatus = "pending" | "approved" | "overdue" | "failed" | "cancelled";

export type AccountStatus =
  | "pending_payment"
  | "awaiting_account_creation"
  | "active"
  | "paused"
  | "passed"
  | "failed_drawdown"
  | "failed_timeout"
  | "cooldown"
  | "approved_for_funded"
  | "rejected";

export type AccountPhase = 1 | 2;

export interface PropUser {
  id: string;
  role: UserRole;
  status: UserStatus;
  name: string;
  email: string;
  primaryEmail?: string;
  password?: string;
  createdAt: string;
}

export interface PlanTemplate {
  id: string;
  name: string;
  accountSize: number;
  fee: number;
  currency?: string;
  profitTargetPhase1Pct: number;
  profitTargetPhase2Pct: number;
  maxDrawdownPct: number;
  dailyLossLimitPct: number;
  minTradingDays: number;
  durationDays: number;
  /** Max share of total profit a single day may represent. 0 disables it. */
  consistencyRulePct?: number;
}

export interface PropAccount {
  id: string;
  userId: string;
  applicationId?: string;
  planId: string;
  accountId: string;
  platformLogin: string;
  platformPassword: string;
  platformName?: string;
  tradeRoomUrl?: string;
  brokerName?: string;
  platformUserId?: string;
  platformEmail?: string;
  phase: AccountPhase;
  status: AccountStatus;
  startDate: string;
  endDate: string;
  cooldownUntil?: string;
  initialBalance: number;
  balance: number;
  todayPnl: number;
  daysTraded: number;
  maxDrawdownHitPct: number;
  performanceSeries: DailyPerformancePoint[];
  notes?: string;
  syncStatus?: string;
  lastSyncedAt?: string;
  updatedAt: string;
  createdAt: string;
}

export interface DailyPerformancePoint {
  date: string;
  pnl: number;
  balance: number;
  phase: AccountPhase;
  breachedDailyLimit: boolean;
}

export interface RiskSnapshot {
  profitPct: number;
  targetPct: number;
  remainingToTarget: number;
  maxAllowedLoss: number;
  dailyLossLimit: number;
  remainingDrawdownBeforeBreach: number;
  remainingDailyLossBeforePause: number;
  isDailyLimitBreached: boolean;
  isHardBreach: boolean;
  isTimeout: boolean;
  isPhaseTargetMet: boolean;

  /* Consistency — the single-day share of total profit. */
  consistencyRulePct: number;
  bestDayProfit: number;
  consistencyPct: number;
  /** Total profit needed so the best day fits inside the rule. */
  requiredTotalProfit: number;
  isConsistencyMet: boolean;
  nominalTargetMoney: number;
  /** The target the trader actually has to reach — it grows with the best day. */
  effectiveTargetMoney: number;
  effectiveTargetPct: number;
  remainingToEffectiveTarget: number;
}

export interface AccountAnalytics {
  snapshot: RiskSnapshot;
  winRatePct: number;
  averageDailyPnl: number;
  pnlVolatility: number;
  consistencyScore: number;
  riskDisciplineScore: number;
  progressScore: number;
  projectedDaysToTarget: number | null;
  everwinEdgeScore: number;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  action: string;
  entityType: "user" | "account" | "system";
  entityId: string;
  payload?: string;
  createdAt: string;
}

export interface PropSubmission {
  id: string;
  submissionCode: string;
  portalUserId?: string;
  planId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  documentType?: string;
  documentNumber?: string;
  cpf?: string;
  phone: string;
  country: string;
  city: string;
  occupation: string;
  experience: string;
  session: string;
  riskPerDay: string;
  motivation: string;
  consistency: string;
  agreeRules: boolean;
  agreeNoGuarantee: boolean;
  agreeLiability: boolean;
  locale: string;
  amount: number;
  currency: string;
  status: SubmissionStatus;
  paymentStatus: PaymentStatus;
  paymentDueAt?: string;
  submittedAt: string;
  paidAt?: string;
  reviewedAt?: string;
  adminNotes?: string;
  /** True hides the public tracking page for this application. */
  publicTrackingDisabled?: boolean;
  /** True stops the page from handing back the credentials, page still opens. */
  credentialsRevealDisabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropPayment {
  id: string;
  applicationId: string;
  paymentCode: string;
  provider: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  checkoutUrl?: string;
  /** Plan default checkout link suggested to the admin (never overwrites a saved one). */
  defaultCheckoutUrl?: string;
  externalReference?: string;
  dueAt?: string;
  approvedAt?: string;
  reminderSentAt?: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicSubmissionBundle {
  application: PropSubmission;
  payment: PropPayment | null;
  plan: PlanTemplate | null;
  user: PropUser | null;
  accounts: PropAccount[];
  loginUrl: string;
  canAccessPortal: boolean;
  /** True once a portal user exists — the password itself never travels here. */
  hasPortalPassword?: boolean;
  /** False once the credentials were delivered: the page opens, the data does not. */
  credentialsRevealAvailable?: boolean;
  vacanciesLocked?: boolean;
  vacanciesMessage?: string;
}

/** Returned only after the applicant proves the email is his. */
export interface SubmissionCredentials {
  email: string;
  phone: string | null;
  document: string | null;
  portalLogin: string | null;
  portalPassword: string | null;
  /** available | changed_by_user | unreadable | none */
  passwordState: string;
  loginUrl: string;
  accounts: Array<{ accountId: string; platformLogin: string }>;
}

export interface PublicSubmissionsConfig {
  vacanciesLocked: boolean;
  vacanciesMessage: string;
}

export interface AdminSubmissionListItem {
  application: PropSubmission;
  payment: Partial<PropPayment> | null;
  user:
    | {
        email: string;
        primaryEmail?: string;
        status: string;
      }
    | null;
  plan:
    | {
        name: string;
        accountSize: number;
        fee: number;
      }
    | null;
}

export interface PropSystemState {
  users: PropUser[];
  plans: PlanTemplate[];
  accounts: PropAccount[];
  auditLogs: AuditLog[];
}

export interface SessionState {
  userId: string;
  loginAt: string;
}

export interface CreateClientInput {
  name: string;
  email: string;
  password?: string;
  primaryEmail?: string;
}

export interface CreateAccountInput {
  userId: string;
  applicationId?: string;
  submissionCode?: string;
  planId: string;
  accountId: string;
  platformLogin: string;
  platformPassword: string;
  platformName?: string;
  tradeRoomUrl?: string;
  brokerName?: string;
  startDate: string;
  notes?: string;
}

export interface UpdateAccountInput {
  accountId: string;
  status?: AccountStatus;
  balance?: number;
  todayPnl?: number;
  daysTraded?: number;
  notes?: string;
  phase?: AccountPhase;
  platformLogin?: string;
  platformPassword?: string;
  platformEmail?: string;
  /** Broker user id that routes trade webhooks here. Empty string unlinks it. */
  platformUserId?: string;
  brokerName?: string;
}

export interface TradeEvent {
  id: string;
  platformUserId: string;
  propAccountId: string | null;
  eventType: "login" | "trade" | "deposit" | "withdrawal" | "unknown";
  payload: Record<string, unknown>;
  flagged: boolean;
  flagReason: string | null;
  createdAt: string;
}

export interface ClientSubmissionItem {
  id: string;
  submissionCode: string;
  planId: string;
  status: string;
  paymentStatus: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  documentType?: string | null;
  documentNumber?: string | null;
  occupation?: string | null;
  experience?: string | null;
  session?: string | null;
  riskPerDay?: string | null;
  motivation?: string | null;
  consistency?: string | null;
  locale?: string | null;
  amount?: number | null;
  currency?: string | null;
  submittedAt: string;
  paidAt: string | null;
  reviewedAt: string | null;
  payment: {
    id: string;
    paymentCode: string;
    status: string;
    amount: number | null;
    currency: string | null;
    approvedAt: string | null;
    dueAt: string | null;
    checkoutUrl: string | null;
  } | null;
}

export interface AccountDailyFeed {
  accountId: string;
  initialBalance: number;
  balance: number;
  days: DailyPerformancePoint[];
}

export interface PoolAccount {
  id: string;
  identifier: string;
  username: string;
  email: string;
  password: string;
  planId: string;
  accountSize: number;
  currency: string;
  platformUserId?: string;
  status: "available" | "assigned" | "disabled";
  assignedAccountId?: string;
  assignedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PoolStockRow {
  planId: string;
  planName: string;
  accountSize: number;
  currency: string;
  available: number;
  assigned: number;
  disabled: number;
}

export interface PoolImportRow {
  identifier: string;
  username: string;
  email: string;
  password: string;
  planId: string;
  accountSize: number;
  currency: string;
  platformUserId?: string;
}

export interface PaymentWebhookEvent {
  id: string;
  eventType: string | null;
  externalId: string | null;
  status: "processed" | "unmatched" | "ignored" | "failed";
  matchedApplicationId?: string | null;
  submissionCode?: string;
  customerName?: string;
  amount: number | null;
  currency: string | null;
  customerEmail: string | null;
  /** Plan inferred from the amount paid — the only product signal Novus sends. */
  detectedPlanId?: string;
  detectedPlanName?: string;
  note: string | null;
  payload: string;
  createdAt: string;
}

export interface PaymentWebhookFeed {
  summary: { processed: number; unmatched: number; ignored: number; failed: number };
  events: PaymentWebhookEvent[];
}

export interface BrokerConnectionStatus {
  ok: boolean;
  stage?: string;
  expiresAt?: string | null;
  message: string;
}

export interface SystemSetting {
  set: boolean;
  preview: string;
  updatedAt?: string;
}

export type EmailLocale = "pt" | "en" | "es";

/** One notification the platform can send, as described by GET /api/email-events. */
export interface EmailEventSetting {
  kind: string;
  label: string;
  description: string;
  /** Transactional delivery (credentials, OTP): no switch exists server-side. */
  alwaysOn: boolean;
  /** The settings key the switch writes to, or null when the event is alwaysOn. */
  enabledKey: string | null;
  /** Whether the event is on when nothing was ever saved. */
  defaultEnabled: boolean;
  enabled: boolean;
  noteKey: string;
  note: string;
}

export interface EmailTestResult {
  ok: boolean;
  message: string;
  providerMessageId?: string | null;
  /** The From/Reply-To the recipient actually saw, resolved from the saved settings. */
  from?: string;
  replyTo?: string;
}

export interface CreateSubmissionInput {
  planKey: "plan_1" | "plan_2" | "plan_3" | "plan_4";
  locale: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  country: string;
  city: string;
  occupation: string;
  experience: string;
  session: string;
  riskPerDay: string;
  motivation: string;
  consistency: string;
  agreeRules: true;
  agreeNoGuarantee: true;
  agreeLiability: true;
}
