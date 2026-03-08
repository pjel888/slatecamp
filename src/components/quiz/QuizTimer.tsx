"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  minutes: number;
  onExpire: () => void;
}

export function QuizTimer({ minutes, onExpire }: Props) {
  const [remainingMs, setRemainingMs] = useState(minutes * 60 * 1000);
  const expireCalled = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMs((prev) => {
        const next = prev - 1000;
        if (next <= 0 && !expireCalled.current) {
          expireCalled.current = true;
          onExpire();
          return 0;
        }
        return Math.max(0, next);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onExpire]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const isWarning = remainingMs < 60000;

  return (
    <span
      className={`font-mono text-sm tabular-nums ${
        isWarning ? "text-color-signal-red" : "text-muted-foreground"
      }`}
    >
      {mins}:{secs.toString().padStart(2, "0")}
    </span>
  );
}
