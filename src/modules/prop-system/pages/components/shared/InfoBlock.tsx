import { cn } from "../../../../../lib/utils";
import { MetricLabel } from "./MetricLabel";

interface InfoBlockProps {
  label: string;
  value: string;
  secondary?: string;
  className?: string;
}

export function InfoBlock({
  label,
  value,
  secondary,
  className,
}: InfoBlockProps) {
  return (
    <div className={cn("portal-card-inner p-3 space-y-1", className)}>
      <MetricLabel variant="default">{label}</MetricLabel>
      <p className="text-sm text-white">{value}</p>
      {secondary && (
        <p className="text-xs text-portal-secondary">{secondary}</p>
      )}
    </div>
  );
}
