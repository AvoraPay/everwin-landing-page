import { cn } from "../../../../../lib/utils";

interface IconBadgeProps {
  icon: React.ReactNode;
  color?: "emerald" | "red" | "amber" | "sky" | "neutral";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colorClasses: Record<NonNullable<IconBadgeProps["color"]>, string> = {
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  red: "bg-red-500/10 border-red-500/20 text-red-400",
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  sky: "bg-sky-500/10 border-sky-500/20 text-sky-400",
  neutral: "bg-white/5 border-portal-border text-white/60",
};

const sizeClasses: Record<NonNullable<IconBadgeProps["size"]>, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function IconBadge({
  icon,
  color = "emerald",
  size = "md",
  className,
}: IconBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-portal-sm border",
        colorClasses[color],
        sizeClasses[size],
        className
      )}
    >
      {icon}
    </div>
  );
}
