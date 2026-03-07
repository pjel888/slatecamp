"use client";

import { Circle, CheckCircle2, XCircle, Square, CheckSquare } from "lucide-react";
import type { Choice } from "@/types/app";

interface Props {
  choice: Choice;
  index: number;
  isSelected: boolean;
  isConfirmed: boolean;
  isMultiSelect: boolean;
  correctAnswer: string;
  onSelect: (choiceId: string) => void;
}

const LABELS = ["A", "B", "C", "D", "E", "F"];

export function ChoiceButton({
  choice,
  index,
  isSelected,
  isConfirmed,
  isMultiSelect,
  correctAnswer,
  onSelect,
}: Props) {
  const correctIds = correctAnswer.split(",");
  const isCorrectChoice = correctIds.includes(choice.id);
  const isWrongSelection = isSelected && !isCorrectChoice && isConfirmed;

  let containerClass = "border-border/60";
  let indicatorClass = "bg-secondary text-muted-foreground";

  if (isConfirmed) {
    if (isCorrectChoice) {
      containerClass = "border-[var(--color-signal-green)] bg-[var(--color-signal-green)]/5 animate-in fade-in-0 duration-300";
      indicatorClass = "bg-[var(--color-signal-green)] text-white";
    } else if (isWrongSelection) {
      containerClass = "border-[var(--color-signal-red)] bg-[var(--color-signal-red)]/5 animate-in shake duration-500";
      indicatorClass = "bg-[var(--color-signal-red)] text-white";
    } else {
      containerClass = "border-border/30 opacity-50";
    }
  } else if (isSelected) {
    containerClass = "border-[var(--color-signal-amber)] bg-[var(--color-signal-amber)]/5 shadow-sm";
    indicatorClass = "bg-[var(--color-signal-amber)] text-white";
  }

  const IndicatorIcon = () => {
    if (isConfirmed) {
      if (isCorrectChoice) return <CheckCircle2 className="h-4 w-4" />;
      if (isWrongSelection) return <XCircle className="h-4 w-4" />;
    }
    if (isMultiSelect) {
      return isSelected
        ? <CheckSquare className="h-4 w-4" />
        : <Square className="h-4 w-4" />;
    }
    return isSelected
      ? <CheckCircle2 className="h-4 w-4" />
      : <Circle className="h-4 w-4" />;
  };

  return (
    <button
      onClick={() => !isConfirmed && onSelect(choice.id)}
      disabled={isConfirmed}
      className={`group flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-200 ${containerClass} ${
        !isConfirmed ? "hover:border-muted-foreground/50 hover:shadow-sm active:scale-[0.98]" : ""
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold transition-all duration-200 ${indicatorClass}`}
      >
        {isConfirmed ? <IndicatorIcon /> : LABELS[index]}
      </span>
      <span className="flex-1 text-[14px] leading-relaxed text-foreground">
        {choice.text}
      </span>
      {!isConfirmed && (
        <span className="shrink-0 text-muted-foreground/50 transition-opacity group-hover:opacity-100 opacity-0">
          <IndicatorIcon />
        </span>
      )}
    </button>
  );
}
