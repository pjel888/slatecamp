"use client";

import { Brain, HelpCircle } from "lucide-react";

interface ConfidenceTapProps {
  onTap: (known: boolean) => void;
  disabled?: boolean;
}

/**
 * F-06: Two large buttons — "I know this" / "Not sure". User taps one before answer is revealed.
 */
export function ConfidenceTap({ onTap, disabled }: ConfidenceTapProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onTap(true)}
        disabled={disabled}
        className="flex h-16 min-h-[64px] items-center justify-center gap-2 rounded-xl border border-color-signal-green/40 bg-color-signal-green/10 font-semibold text-foreground transition-all duration-150 hover:bg-color-signal-green/20 disabled:opacity-50"
      >
        <Brain className="h-5 w-5" strokeWidth={1.5} />
        I know this
      </button>
      <button
        type="button"
        onClick={() => onTap(false)}
        disabled={disabled}
        className="flex h-16 min-h-[64px] items-center justify-center gap-2 rounded-xl border border-color-signal-amber/40 bg-color-signal-amber/10 font-semibold text-foreground transition-all duration-150 hover:bg-color-signal-amber/20 disabled:opacity-50"
      >
        <HelpCircle className="h-5 w-5" strokeWidth={1.5} />
        Not sure
      </button>
    </div>
  );
}
