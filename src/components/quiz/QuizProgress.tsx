'use client';

import { useRef, useEffect, useState } from 'react';

interface Props {
  current: number;
  total: number;
  /** 1-based question number (e.g. 1 for first question). Used when inline is true. */
  currentQuestionIndex?: number;
  lastAnswerCorrect?: boolean;
  /** When true, progress is rendered on top of the quiz card with "Question X of Y". */
  inline?: boolean;
}

export function QuizProgress({
  current,
  total,
  currentQuestionIndex = 1,
  lastAnswerCorrect,
  inline = true,
}: Props) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const [showPulse, setShowPulse] = useState(false);
  const prevCurrent = useRef(current);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (current > prevCurrent.current && lastAnswerCorrect && !prefersReducedMotion.current) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 150);
      return () => clearTimeout(timer);
    }
    prevCurrent.current = current;
  }, [current, lastAnswerCorrect]);

  if (inline) {
    return (
      <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-4 py-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/40">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor:
                percentage < 50 ? 'var(--color-signal-amber)' : 'var(--color-signal-green)',
              transform: showPulse ? 'scaleY(1.2)' : 'scaleY(1)',
            }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
          Question {currentQuestionIndex} of {total}
        </span>
      </div>
    );
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-border/30">
      <div
        className="h-full rounded-r-full transition-all duration-300 ease-out"
        style={{
          width: `${percentage}%`,
          backgroundColor:
            percentage < 50 ? 'var(--color-signal-amber)' : 'var(--color-signal-green)',
          transform: showPulse ? 'scaleY(2)' : 'scaleY(1)',
        }}
      />
    </div>
  );
}
