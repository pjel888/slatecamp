"use client";

import type { Choice } from "@/types/app";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";

interface Props {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string | null;
  choices: Choice[];
  isMultiSelect: boolean;
  streak: number;
}

export function FeedbackPanel({
  isCorrect,
  correctAnswer,
  explanation,
  choices,
  isMultiSelect,
  streak,
}: Props) {
  const correctIds = correctAnswer.split(",");
  const correctChoices = choices.filter((c) => correctIds.includes(c.id));

  return (
    <div
      className={`mt-6 overflow-hidden rounded-2xl border transition-all duration-500 animate-in slide-in-from-bottom-4 fade-in-0 ${
        isCorrect
          ? "border-color-signal-green/30 bg-color-signal-green/5"
          : "border-color-signal-red/30 bg-color-signal-red/5"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {isCorrect ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-color-signal-green animate-in zoom-in-50 duration-300" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-color-signal-red animate-in zoom-in-50 duration-300" />
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                {isCorrect ? "Correct!" : "Incorrect"}
              </p>
              {isCorrect && streak >= 3 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-color-signal-amber/10 px-2 py-0.5 text-[10px] font-semibold text-color-signal-amber animate-in zoom-in-75 duration-500">
                  <Sparkles className="h-3 w-3" />
                  {streak} streak
                </span>
              )}
            </div>
            {!isCorrect && correctChoices.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {isMultiSelect ? "The correct answers are: " : "The correct answer is: "}
                <strong>{correctChoices.map((c) => c.text).join(", ")}</strong>
              </p>
            )}
            {explanation && (
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {explanation}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
