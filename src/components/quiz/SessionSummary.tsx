"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils/helpers";
import { Trophy, Clock, Target, ArrowRight, CheckCircle2, XCircle, Sparkles, PartyPopper } from "lucide-react";
import Link from "next/link";
import type { Question } from "@/types/app";

interface Props {
  result: {
    total: number;
    correct: number;
    totalTime: number;
    scorePercentage: number;
  };
  answers: Record<string, { selected: string; correct: boolean }>;
  questions: Question[];
}

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <>{display}</>;
}

export function SessionSummary({ result, answers, questions }: Props) {
  const avgTime = result.total > 0 ? result.totalTime / result.total : 0;
  const isGreat = result.scorePercentage >= 80;
  const isPerfect = result.scorePercentage === 100;

  return (
    <div className="mx-auto max-w-[720px] space-y-8 py-8 animate-in fade-in-0 slide-in-from-bottom-6 duration-700">
      {/* Celebration for high scores */}
      {isGreat && (
        <div className="flex justify-center animate-in zoom-in-50 duration-500">
          <div className="flex items-center gap-2 rounded-full bg-color-signal-amber/10 px-4 py-2">
            {isPerfect ? (
              <PartyPopper className="h-5 w-5 text-color-signal-amber" />
            ) : (
              <Sparkles className="h-5 w-5 text-color-signal-amber" />
            )}
            <span className="text-sm font-semibold text-color-signal-amber">
              {isPerfect ? "Perfect Score!" : "Excellent Work!"}
            </span>
          </div>
        </div>
      )}

      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Session Complete
        </h1>
        <p className="mt-2 text-muted-foreground">
          Here&apos;s how you did.
        </p>
      </div>

      {/* Score ring */}
      <div className="flex justify-center">
        <div
          className={`flex h-40 w-40 flex-col items-center justify-center rounded-full border-4 transition-all duration-1000 ${
            isGreat
              ? "border-color-signal-green shadow-lg shadow-color-signal-green/10"
              : result.scorePercentage >= 50
                ? "border-color-signal-amber"
                : "border-color-signal-red"
          }`}
        >
          <span className="text-4xl font-semibold tabular-nums text-foreground">
            <AnimatedNumber value={Math.round(result.scorePercentage)} />%
          </span>
          <span className="text-xs text-muted-foreground">
            {result.correct}/{result.total}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="animate-in fade-in-0 slide-in-from-bottom-3 duration-500" style={{ animationDelay: "200ms" }}>
          <CardContent className="flex flex-col items-center py-4">
            <Trophy className="h-5 w-5 text-color-signal-amber" strokeWidth={1.5} />
            <span className="mt-2 text-2xl font-semibold tabular-nums">
              <AnimatedNumber value={result.correct} duration={800} />
            </span>
            <span className="text-xs text-muted-foreground">Correct</span>
          </CardContent>
        </Card>
        <Card className="animate-in fade-in-0 slide-in-from-bottom-3 duration-500" style={{ animationDelay: "350ms" }}>
          <CardContent className="flex flex-col items-center py-4">
            <Clock className="h-5 w-5 text-color-signal-blue" strokeWidth={1.5} />
            <span className="mt-2 text-2xl font-semibold tabular-nums">
              {formatDuration(result.totalTime)}
            </span>
            <span className="text-xs text-muted-foreground">Total Time</span>
          </CardContent>
        </Card>
        <Card className="animate-in fade-in-0 slide-in-from-bottom-3 duration-500" style={{ animationDelay: "500ms" }}>
          <CardContent className="flex flex-col items-center py-4">
            <Target className="h-5 w-5 text-color-signal-green" strokeWidth={1.5} />
            <span className="mt-2 text-2xl font-semibold tabular-nums">
              {formatDuration(avgTime)}
            </span>
            <span className="text-xs text-muted-foreground">Avg/Question</span>
          </CardContent>
        </Card>
      </div>

      {/* Question review */}
      <div className="space-y-3">
        <h2 className="text-base font-medium text-foreground">
          Question Review
        </h2>
        {questions.map((q, i) => {
          const answer = answers[q.id];
          return (
            <div
              key={q.id}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                answer?.correct
                  ? "border-color-signal-green/20 bg-color-signal-green/5"
                  : "border-color-signal-red/20 bg-color-signal-red/5"
              }`}
            >
              {answer?.correct ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-color-signal-green" />
              ) : (
                <XCircle className="h-5 w-5 shrink-0 text-color-signal-red" />
              )}
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-secondary text-[11px] font-medium text-muted-foreground">
                {i + 1}
              </span>
              <span className="line-clamp-1 text-sm text-foreground">
                {q.prompt}
              </span>
              {q.is_multi_select && (
                <span className="ml-auto shrink-0 rounded bg-color-signal-blue/10 px-1.5 py-0.5 text-[10px] text-color-signal-blue">
                  Multi
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/dashboard/quiz" className="flex-1">
          <Button variant="outline" className="w-full rounded-xl">
            New Quiz
          </Button>
        </Link>
        <Link href="/dashboard" className="flex-1">
          <Button className="w-full rounded-xl">
            Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
