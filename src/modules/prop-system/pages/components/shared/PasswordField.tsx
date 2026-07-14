"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../../../../lib/utils";
import { CopyButton } from "./CopyButton";

interface PasswordFieldProps {
  value: string;
  showLabel?: string;
  hideLabel?: string;
  copyable?: boolean;
  className?: string;
}

export function PasswordField({
  value,
  showLabel = "Show password",
  hideLabel = "Hide password",
  copyable = false,
  className,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  const ToggleIcon = visible ? EyeOff : Eye;

  return (
    <div
      className={cn(
        "portal-card-inner flex items-center gap-2 px-3 py-2",
        className
      )}
    >
      <span className="flex-1 font-mono text-sm text-white/90 select-all truncate">
        {visible ? value : "\u2022".repeat(Math.min(value.length, 24))}
      </span>

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="portal-focus inline-flex items-center justify-center h-7 w-7 rounded-portal-xs text-portal-muted hover:text-white/80 transition-colors"
        aria-label={visible ? hideLabel : showLabel}
      >
        <ToggleIcon size={14} />
      </button>

      {copyable && <CopyButton value={value} size="sm" />}
    </div>
  );
}
