"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Brain, Clock, Info, Ribbon, Target, Zap } from "lucide-react";

export interface QuizModeInfo {
  label: string;
  tier: "free" | "pro" | "max";
  desc: string;
  iconName: "brain" | "clock" | "zap" | "target";
  howItWorks: string[];
  bestFor: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  brain: Brain,
  clock: Clock,
  zap: Zap,
  target: Target,
};

interface QuizModeInfoPopoverProps {
  mode: QuizModeInfo;
}

export function QuizModeInfoPopover({ mode }: QuizModeInfoPopoverProps) {
  const Icon = ICON_MAP[mode.iconName] ?? ICON_MAP.brain;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground/50 transition-colors hover:bg-secondary hover:text-muted-foreground"
          aria-label={`Learn more about ${mode.label}`}
        >
          <Info className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={8}
        className="w-80 rounded-xl border border-border bg-card p-0 shadow-lg"
      >
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber/10 text-amber">
              <Icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{mode.label}</p>
              <p className="text-[11px] text-muted-foreground">
                {mode.tier === "free"
                  ? "Available to all"
                  : `Requires ${mode.tier.toUpperCase()} plan`}
              </p>
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              How it works
            </p>
            <ul className="space-y-1">
              {mode.howItWorks.map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[12px] leading-relaxed text-foreground/90"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber" />
                  {step}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Ribbon className="h-3.5 w-3.5 shrink-0 text-amber" strokeWidth={1.5} />
              <span>
                <strong className="text-foreground">Best for:</strong> {mode.bestFor}
              </span>
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
