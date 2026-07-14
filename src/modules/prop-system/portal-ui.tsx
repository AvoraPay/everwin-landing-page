import type { HTMLAttributes, ReactNode } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import type { PortalTone } from "./portal-presentation";

/* ─── Design Tokens ─── */

export const DESIGN = {
  radius: {
    card: "rounded-xl",
    input: "rounded-lg",
    pill: "rounded-full",
    button: "rounded-lg",
  },
  spacing: {
    page: "space-y-6",
    section: "space-y-4",
    field: "space-y-1.5",
    tight: "space-y-2",
  },
} as const;

/* ─── Dark mode tokens — match home page exactly:
   bg-body:    rgb(24,27,36)   = bg-[#181b24]
   bg-card:    rgb(23,26,35)   = bg-[#171a23]
   bg-surface: rgb(37,42,54)   = bg-[#252a36]
   border:     rgba(255,255,255,0.07)
   border-h:   rgba(255,255,255,0.12)
   text:       white / white/70 / white/50 / white/35
   accent:     emerald-500
*/

/* ─── Tone maps (light/dark) ─── */

const toneClasses: Record<PortalTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-600 dark:border-white/[0.07] dark:bg-[#171a23] dark:text-white/70",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
  warning: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
  danger: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400",
  info: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-400",
};

const surfaceToneClasses = {
  default: "border-slate-200 bg-white text-slate-950 shadow-sm dark:border-white/[0.07] dark:bg-[#171a23] dark:text-white",
  subtle: "border-slate-100 bg-slate-50/80 text-slate-950 dark:border-white/[0.05] dark:bg-white/[0.02] dark:text-white/90",
  inverse: "border-[#252a36] bg-[#181b24] text-white dark:border-white/[0.12] dark:bg-[#0f1118]",
} as const;

/* ─── Page Header ─── */

export function PortalPageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="space-y-3 pb-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1 text-xs font-medium text-slate-400 dark:text-white/50">{eyebrow}</p>
          ) : null}
          <h1 className="font-bricolage_grotesque text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h1>
          {description ? <p className="mt-0.5 text-sm text-slate-500 dark:text-white/50">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
      {meta ? <div className="flex flex-wrap gap-2">{meta}</div> : null}
    </div>
  );
}

/* ─── Surface ─── */

export function PortalSurface({
  children,
  className,
  tone = "default",
  padding = "md",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: keyof typeof surfaceToneClasses;
  padding?: "none" | "sm" | "md" | "lg";
}) {
  const p = padding === "none" ? "" : padding === "sm" ? "p-4" : padding === "lg" ? "p-6" : "p-5";
  return (
    <div className={cn("overflow-hidden rounded-xl border", surfaceToneClasses[tone], p, className)} {...props}>
      {children}
    </div>
  );
}

/* ─── Section ─── */

export function PortalSection({
  title,
  description,
  actions,
  children,
  tone = "default",
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  tone?: keyof typeof surfaceToneClasses;
  className?: string;
}) {
  return (
    <PortalSurface tone={tone} padding="none" className={className}>
      <div className={cn("border-b px-5 py-3", tone === "inverse" ? "border-white/10" : "border-slate-100 dark:border-white/[0.07]")}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className={cn("text-sm font-semibold", tone === "inverse" ? "text-white" : "text-slate-950 dark:text-white")}>{title}</h3>
            {description ? <p className={cn("mt-0.5 text-xs", tone === "inverse" ? "text-white/50" : "text-slate-500 dark:text-white/50")}>{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </PortalSurface>
  );
}

/* ─── Stat Card ─── */

export function PortalStatCard({
  label,
  value,
  helper,
  icon,
  tone = "neutral",
  className,
}: {
  label: string;
  value: ReactNode;
  helper?: string;
  icon?: ReactNode;
  tone?: PortalTone;
  className?: string;
}) {
  const accentBorder: Record<PortalTone, string> = {
    neutral: "border-l-slate-300 dark:border-l-white/20",
    success: "border-l-emerald-500",
    warning: "border-l-amber-500",
    danger: "border-l-red-500",
    info: "border-l-sky-500",
  };

  return (
    <PortalSurface className={cn("border-l-2", accentBorder[tone], className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-white/50">{label}</p>
          <p className="mt-1.5 font-bricolage_grotesque text-xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</p>
          {helper ? <p className="mt-1 text-xs text-slate-400 dark:text-white/40">{helper}</p> : null}
        </div>
        {icon ? (
          <span className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", toneClasses[tone])}>
            {icon}
          </span>
        ) : null}
      </div>
    </PortalSurface>
  );
}

/* ─── Status Pill ─── */

export function PortalStatusPill({
  tone,
  children,
  className,
}: {
  tone: PortalTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", toneClasses[tone], className)}>
      {children}
    </span>
  );
}

/* ─── Filter Bar ─── */

export function PortalFilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center", className)}>
      {children}
    </div>
  );
}

/* ─── Filter Chip ─── */

export function PortalFilterChip({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-white/[0.07] dark:bg-[#171a23] dark:text-white/70 dark:hover:border-white/[0.12] dark:hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

/* ─── Search Input ─── */

export function PortalSearchInput({
  value,
  onChange,
  placeholder,
  className,
}: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn("relative min-w-[220px] flex-1", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/35" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-sm dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30"
      />
    </div>
  );
}

/* ─── Loading State ─── */

export function PortalLoadingState({ title = "Carregando", lines = 4 }: { title?: string; lines?: number }) {
  return (
    <PortalSurface>
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-white/50">
        <Loader2 className="h-4 w-4 animate-spin" />
        {title}
      </div>
      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-white/[0.04]" />
        ))}
      </div>
    </PortalSurface>
  );
}

/* ─── Empty State ─── */

export function PortalEmptyState({
  title,
  description,
  icon,
  action,
  className,
}: { title: string; description?: string; icon?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center dark:border-white/[0.07] dark:bg-[#171a23]", className)}>
      {icon ? <div className="mb-3 text-slate-300 dark:text-white/20">{icon}</div> : null}
      <p className="text-sm font-semibold text-slate-700 dark:text-white/90">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-slate-400 dark:text-white/40">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/* ─── Pagination ─── */

export function PortalPagination({
  page, totalPages, totalItems, pageSize, onPageChange,
}: { page: number; totalPages: number; totalItems: number; pageSize: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-white/[0.07]">
      <p className="text-xs text-slate-500 dark:text-white/40">{start}–{end} de {totalItems}</p>
      <div className="flex items-center gap-1">
        <Button type="button" variant="outline" size="sm" disabled={page === 1} className="h-8 w-8 p-0 dark:border-white/[0.07] dark:bg-[#171a23] dark:text-white/70" onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[56px] text-center text-xs font-medium text-slate-500 dark:text-white/40">{page} / {totalPages}</span>
        <Button type="button" variant="outline" size="sm" disabled={page === totalPages} className="h-8 w-8 p-0 dark:border-white/[0.07] dark:bg-[#171a23] dark:text-white/70" onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ─── Drawer ─── */

export function PortalDrawer({
  open, onOpenChange, title, description, children, widthClassName = "max-w-[680px]",
}: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children: ReactNode; widthClassName?: string }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("left-auto right-0 top-0 h-screen max-h-none translate-x-0 translate-y-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-xl dark:border-white/[0.07] dark:bg-[#181b24]", widthClassName)}>
        <DialogHeader className="border-b border-slate-100 px-6 py-4 dark:border-white/[0.07]">
          <DialogTitle className="text-base font-semibold dark:text-white">{title}</DialogTitle>
          {description ? <DialogDescription className="text-sm text-slate-500 dark:text-white/50">{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="h-[calc(100vh-72px)] overflow-y-auto px-6 py-5">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Confirm Dialog ─── */

export function PortalConfirmDialog({
  open, onOpenChange, title, description, confirmLabel, cancelLabel = "Cancelar", tone = "danger", loading, onConfirm,
}: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description: string; confirmLabel: string; cancelLabel?: string; tone?: PortalTone; loading?: boolean; onConfirm: () => void | Promise<void> }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] rounded-xl border-slate-200 bg-white p-0 dark:border-white/[0.07] dark:bg-[#181b24]">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold dark:text-white">{title}</DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-white/50">{description}</DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="dark:border-white/[0.07] dark:bg-[#171a23] dark:text-white/70">{cancelLabel}</Button>
            <Button
              type="button"
              size="sm"
              className={cn(
                tone === "danger" ? "bg-red-600 text-white hover:bg-red-500" :
                tone === "warning" ? "bg-amber-600 text-white hover:bg-amber-500" :
                "bg-emerald-600 text-white hover:bg-emerald-500",
              )}
              disabled={loading}
              onClick={() => void onConfirm()}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Field ─── */

export function PortalField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-500 dark:text-white/50">{label}</label>
      {hint ? <p className="text-[11px] text-slate-400 dark:text-white/35">{hint}</p> : null}
      {children}
    </div>
  );
}

/* ─── Metric List ─── */

export function PortalMetricList({
  items,
  columns = 2,
  inverse = false,
}: {
  items: Array<{ label: string; value: ReactNode; hint?: ReactNode }>;
  columns?: 1 | 2 | 3 | 4;
  inverse?: boolean;
}) {
  return (
    <div className={cn(
      "grid gap-3",
      columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-1 sm:grid-cols-2" : columns === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4",
    )}>
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "rounded-xl border px-4 py-3",
            inverse ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50/50 dark:border-white/[0.05] dark:bg-white/[0.02]",
          )}
        >
          <p className={cn("text-xs font-medium", inverse ? "text-white/50" : "text-slate-400 dark:text-white/40")}>{item.label}</p>
          <div className={cn("mt-1.5 text-sm font-semibold", inverse ? "text-white" : "text-slate-950 dark:text-white")}>{item.value}</div>
          {item.hint ? <div className={cn("mt-0.5 text-[11px]", inverse ? "text-white/40" : "text-slate-400 dark:text-white/35")}>{item.hint}</div> : null}
        </div>
      ))}
    </div>
  );
}

/* ─── Table Header ─── */

export function PortalTableHeader({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-slate-200 dark:border-white/[0.07]">
        {children}
      </tr>
    </thead>
  );
}

export function PortalTh({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={cn("px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/40 first:pl-0 last:pr-0", className)}>
      {children}
    </th>
  );
}

/* ─── Table Row ─── */

export function PortalTableRow({
  children,
  className,
}: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn("border-b border-slate-100 last:border-b-0 dark:border-white/[0.05]", className)}>
      {children}
    </tr>
  );
}

/* ─── Data Label ─── */

export function PortalDataLabel({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/40">{children}</p>;
}

/* ─── Divider ─── */

export function PortalDivider() {
  return <div className="border-t border-slate-100 dark:border-white/[0.07]" />;
}

/* ─── Feedback ─── */

export function PortalFeedback({ ok, message }: { ok: boolean; message: string }) {
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm leading-6", ok ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400" : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400")}>
      {message}
    </div>
  );
}
