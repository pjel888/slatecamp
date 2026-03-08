"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, Lock, Target, Zap } from "lucide-react";
import {
  QuizModeInfoPopover,
  type QuizModeInfo,
} from "@/components/quiz/quiz-mode-info-popover";

const QUIZ_MODES: QuizModeInfo[] = [
  {
    label: "Practice",
    desc: "Untimed, immediate feedback with explanations.",
    iconName: "brain",
    tier: "free",
    howItWorks: [
      "Answer at your own pace — no timer",
      "See instant feedback after confirming each answer",
      "Full explanations and references provided",
      "Great for learning new material",
    ],
    bestFor: "Building foundational knowledge",
  },
  {
    label: "Timed Test",
    desc: "Simulate real exam conditions with a timer.",
    iconName: "clock",
    tier: "free",
    howItWorks: [
      "Set a time limit that mirrors the real exam",
      "No feedback until the session is complete",
      "Results and analytics shown after submission",
      "Tracks your time-per-question performance",
    ],
    bestFor: "Exam simulation and time management practice",
  },
  {
    label: "SRS Review",
    desc: "Questions from your spaced repetition queue.",
    iconName: "zap",
    tier: "pro",
    howItWorks: [
      "Uses SM-2 spaced repetition algorithm",
      "Surfaces questions you're about to forget",
      "Intervals adapt based on your performance",
      "Optimizes long-term retention efficiently",
    ],
    bestFor: "Maximizing memory retention before exams",
  },
  {
    label: "AI Adaptive",
    desc: "IRT-driven difficulty targeting P(correct) ≈ 0.75.",
    iconName: "target",
    tier: "max",
    howItWorks: [
      "Uses Item Response Theory (IRT) psychometric model",
      "Adapts question difficulty to your ability level (θ)",
      "Targets the zone of proximal development",
      "Provides the most efficient learning path",
    ],
    bestFor: "Advanced learners preparing for mastery",
  },
];

const ICON_MAP: Record<string, React.ElementType> = {
  brain: Brain,
  clock: Clock,
  zap: Zap,
  target: Target,
};

export function QuizModeCards() {
  return (
    <section>
      <div className="mb-3 flex items-center gap-1.5">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Quiz Mode
        </h2>
        <span className="text-[10px] text-muted-foreground/70">
          (Info on each mode)
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {QUIZ_MODES.map((mode) => {
          const Icon = ICON_MAP[mode.iconName] ?? Brain;
          return (
            <Card
              key={mode.label}
              className="relative flex items-start gap-4 rounded-2xl border-2 p-4 transition-all"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <CardContent className="min-w-0 flex-1 p-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {mode.label}
                      </span>
                      {mode.tier !== "free" && (
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          {mode.tier}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {mode.desc}
                    </p>
                  </div>
                  <QuizModeInfoPopover mode={mode} />
                </div>
                {mode.tier !== "free" && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Requires {mode.tier.toUpperCase()} plan
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
