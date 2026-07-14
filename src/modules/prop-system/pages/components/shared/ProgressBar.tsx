import { cn } from "../../../../../lib/utils";

interface ProgressBarProps {
  value: number;
  variant?: "emerald" | "danger" | "warning" | "dynamic";
  size?: "sm" | "md";
  glow?: boolean;
  label?: string;
  className?: string;
}

function getBarColor(variant: NonNullable<ProgressBarProps["variant"]>, value: number): string {
  if (variant === "dynamic") {
    if (value < 50) return "bg-emerald-500";
    if (value <= 75) return "bg-amber-500";
    return "bg-red-500";
  }

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500",
    danger: "bg-red-500",
    warning: "bg-amber-500",
  };

  return colorMap[variant] ?? "bg-emerald-500";
}

export function ProgressBar({
  value,
  variant = "emerald",
  size = "sm",
  glow = false,
  label,
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex-1 rounded-full bg-portal-subtle-hover overflow-hidden",
          size === "sm" ? "h-1.5" : "h-2.5"
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            getBarColor(variant, clamped),
            glow && "shadow-portal-glow"
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>

      {label && (
        <span className="text-xs text-portal-muted whitespace-nowrap">
          {clamped}%
        </span>
      )}
    </div>
  );
}
