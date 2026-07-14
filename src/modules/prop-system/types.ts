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
  vacanciesLocked?: boolean;
  vacanciesMessage?: string;
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

export interface SystemSetting {
  set: boolean;
  preview: string;
  updatedAt?: string;
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
