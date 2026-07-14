import { cn } from "../../../../../lib/utils";

interface PortalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "inner" | "emerald" | "modal";
  padding?: "none" | "sm" | "md" | "lg";
}

const variantClasses: Record<NonNullable<PortalCardProps["variant"]>, string> = {
  default: "portal-card",
  inner: "portal-card-inner",
  emerald: "portal-card border-emerald-500/20",
  modal: "bg-portal-modal border-portal-border rounded-portal-lg",
};

const paddingClasses: Record<NonNullable<PortalCardProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-7",
};

export function PortalCard({
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}: PortalCardProps) {
  return (
    <div
      className={cn(variantClasses[variant], paddingClasses[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
}
