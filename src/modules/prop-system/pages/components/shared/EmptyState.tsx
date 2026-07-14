import { cn } from "../../../../../lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  icon,
  message,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-portal-md border border-dashed border-portal-border bg-portal-subtle px-6 py-16 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-3 flex justify-center text-portal-muted">
          {icon}
        </div>
      )}
      <p className="text-sm text-portal-secondary">{message}</p>
      {description && (
        <p className="mt-1 text-xs text-portal-muted">{description}</p>
      )}
    </div>
  );
}
