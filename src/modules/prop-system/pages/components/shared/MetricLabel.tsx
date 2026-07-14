import { cn } from "../../../../../lib/utils";

interface MetricLabelProps extends React.HTMLAttributes<HTMLElement> {
  as?: "p" | "span" | "label";
  variant?: "default" | "emerald" | "muted";
}

const variantClasses: Record<NonNullable<MetricLabelProps["variant"]>, string> = {
  default: "portal-label",
  emerald: "portal-label text-emerald-400",
  muted: "portal-label text-portal-muted",
};

export function MetricLabel({
  as: Tag = "p",
  variant = "default",
  className,
  children,
  ...props
}: MetricLabelProps) {
  return (
    <Tag className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </Tag>
  );
}
