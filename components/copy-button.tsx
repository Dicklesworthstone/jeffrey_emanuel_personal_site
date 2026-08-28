"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Copy, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";

interface CopyButtonProps {
  text: string;
  className?: string;
  onCopy?: () => void;
}

const STATUS_LABEL = {
  idle: "Copy to clipboard",
  copied: "Copied to clipboard",
  error: "Copy failed. Select the text and press Ctrl+C or Cmd+C.",
} as const;

export default function CopyButton({ text, className, onCopy }: CopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const { lightTap, mediumTap } = useHapticFeedback();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent clicks (e.g. if inside a clickable card)
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      lightTap();
      onCopy?.();
      
      timeoutRef.current = setTimeout(() => {
        setStatus("idle");
      }, 2000);
    } catch {
      setStatus("error");
      mediumTap();
      timeoutRef.current = setTimeout(() => {
        setStatus("idle");
      }, 2000);
    }
  }, [text, lightTap, mediumTap, onCopy]);

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900",
        status === "idle" && "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-700 hover:text-slate-200",
        status === "copied" && "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
        status === "error" && "border-red-500/50 bg-red-500/10 text-red-400",
        className
      )}
      aria-label={STATUS_LABEL[status]}
      title={status === "copied" ? "Copied" : "Copy"}
    >
      {status === "idle" && <Copy className="h-4 w-4" aria-hidden="true" />}
      {status === "copied" && <Check className="h-4 w-4" aria-hidden="true" />}
      {status === "error" && <X className="h-4 w-4" aria-hidden="true" />}
      {/* Announce the outcome to assistive tech; the icon swap alone is silent. */}
      <span role="status" aria-live="polite" className="sr-only">
        {status === "idle" ? "" : STATUS_LABEL[status]}
      </span>
    </button>
  );
}
