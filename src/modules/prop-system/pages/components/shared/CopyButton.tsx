"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "../../../../../lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  copiedLabel?: string;
  variant?: "icon" | "chip";
  size?: "sm" | "md";
  className?: string;
}

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  variant = "icon",
  size = "sm",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const iconSize = size === "sm" ? 14 : 16;
  const Icon = copied ? Check : Copy;

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "portal-focus inline-flex items-center justify-center rounded-portal-xs transition-colors",
          size === "sm" ? "h-7 w-7" : "h-8 w-8",
          copied
            ? "text-emerald-400"
            : "text-portal-muted hover:text-white/80",
          className
        )}
        aria-label={copied ? copiedLabel : label}
      >
        <Icon size={iconSize} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "portal-focus inline-flex items-center gap-1.5 rounded-portal-xs px-2.5 py-1 text-xs transition-colors",
        copied
          ? "text-emerald-400 bg-emerald-500/10"
          : "text-portal-muted hover:text-white/80 bg-white/5 hover:bg-white/10",
        className
      )}
    >
      <span>{copied ? copiedLabel : label}</span>
      <Icon size={iconSize} />
    </button>
  );
}
