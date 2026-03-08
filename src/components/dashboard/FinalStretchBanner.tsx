"use client";

import { CalendarDays } from "lucide-react";
import type { FinalStretchPhase } from "@/lib/actions/final-stretch";

interface FinalStretchBannerProps {
  daysLeft: number;
  phase: FinalStretchPhase;
  examName?: string;
}

const PHASE_LABELS: Record<FinalStretchPhase, string> = {
  final_approach: "Final approach",
  countdown: "Countdown",
  final_week: "Final week",
  exam_eve: "Exam eve",
};

export function FinalStretchBanner({
  daysLeft,
  phase,
  examName = "ALE",
}: FinalStretchBannerProps) {
  return (
    <div
      className="rounded-xl border px-4 py-3 flex items-center justify-between gap-4"
      style={{
        backgroundColor: "var(--final-stretch-bg, #FFF5F5)",
        borderColor: "var(--final-stretch-accent, #EF4444)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: "var(--final-stretch-accent, #EF4444)" }}
        >
          <CalendarDays className="h-5 w-5 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            T-{daysLeft} days to your {examName}
          </p>
          <p className="text-xs text-muted-foreground">{PHASE_LABELS[phase]}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold font-mono text-foreground">{daysLeft}</p>
        <p className="text-[10px] text-muted-foreground">days left</p>
      </div>
    </div>
  );
}
