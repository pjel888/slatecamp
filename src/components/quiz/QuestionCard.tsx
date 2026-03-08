"use client";

import type { Question, Choice } from "@/types/app";
import { ChoiceButton } from "./ChoiceButton";
import { ImageIcon } from "lucide-react";

interface Props {
  question: Question;
  selectedAnswers: string[];
  isConfirmed: boolean;
  onSelectAnswer: (choiceId: string) => void;
}

export function QuestionCard({
  question,
  selectedAnswers,
  isConfirmed,
  onSelectAnswer,
}: Props) {
  const choices = (question.choices as Choice[] | null) ?? [];

  return (
    <div className="space-y-6">
      {/* Media area */}
      {(question.media_url || (question.image_urls?.length > 0)) && (
        <div className="overflow-hidden rounded-2xl border border-border/40 bg-secondary/30">
          {question.media_url ? (
            <img
              src={question.media_url}
              alt="Question visual"
              className="w-full max-h-72 object-contain"
            />
          ) : question.image_urls?.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto p-3">
              {question.image_urls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Reference ${i + 1}`}
                  className="max-h-64 rounded-xl object-contain"
                />
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* Placeholder media frame when no image exists */}
      {!question.media_url && (!question.image_urls || question.image_urls.length === 0) && (
        <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-secondary/20">
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground/40">
            <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
            <span className="text-[11px]">Visual reference area</span>
          </div>
        </div>
      )}

      {/* Question prompt */}
      <div>
        {question.is_multi_select && (
          <span className="mb-2 inline-flex items-center rounded-lg bg-[var(--color-signal-blue)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--color-signal-blue)]">
            Select all that apply
          </span>
        )}
        <p className="text-[17px] leading-relaxed text-foreground">
          {question.prompt}
        </p>
      </div>

      {/* Choices */}
      <div className="space-y-2.5">
        {choices.map((choice, index) => (
          <ChoiceButton
            key={choice.id}
            choice={choice}
            index={index}
            isSelected={selectedAnswers.includes(choice.id)}
            isConfirmed={isConfirmed}
            isMultiSelect={question.is_multi_select ?? false}
            correctAnswer={question.correct_answer}
            onSelect={onSelectAnswer}
          />
        ))}
      </div>
    </div>
  );
}
