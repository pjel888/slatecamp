"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { submitAnswer, completeSession, markQuestionPresented } from "../actions";
import { Button } from "@/components/ui/button";
import { Check, X, ChevronRight, BookOpen, ExternalLink, Lightbulb, Box, Bookmark } from "lucide-react";
import type { ReviewSession, SessionQuestion, Question, Choice } from "@/types/app";

interface QuizEngineProps {
  session: ReviewSession;
  sessionQuestions: SessionQuestion[];
}

export function QuizEngine({ session, sessionQuestions }: QuizEngineProps) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(() => {
    const firstUnanswered = sessionQuestions.findIndex((sq) => !sq.answered_at);
    return firstUnanswered >= 0 ? firstUnanswered : 0;
  });
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answeredMap, setAnsweredMap] = useState<Record<string, { answer: string; correct: boolean }>>(() => {
    const map: Record<string, { answer: string; correct: boolean }> = {};
    for (const sq of sessionQuestions) {
      if (sq.selected_answer && sq.is_correct !== null) {
        map[sq.id] = { answer: sq.selected_answer, correct: sq.is_correct };
      }
    }
    return map;
  });
  const questionStartRef = useRef(Date.now());

  const sq = sessionQuestions[currentIdx];
  const question = sq?.questions as Question | undefined;
  const choices = (question?.choices ?? []) as Choice[];
  const answered = sq ? answeredMap[sq.id] : undefined;
  const isAnswered = !!answered || selectedAnswer !== null;
  const showFeedback = session.config.show_immediate_feedback !== false;
  const totalQuestions = sessionQuestions.length;
  const progress = Object.keys(answeredMap).length;

  useEffect(() => {
    if (sq && !sq.presented_at) {
      markQuestionPresented(sq.id);
    }
  }, [sq]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!question) return;

    if (['1', '2', '3', '4'].includes(e.key) && !isAnswered) {
      const idx = parseInt(e.key) - 1;
      if (choices[idx]) handleSelectAnswer(choices[idx].id);
    }
    if (e.key === 'Enter' && isAnswered) {
      handleNext();
    }
    if (e.key === 'Escape') {
      router.push("/dashboard/sessions");
    }
  }, [question, isAnswered, choices]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  async function handleSelectAnswer(choiceId: string) {
    if (isAnswered || !sq || !question || isSubmitting) return;
    setIsSubmitting(true);
    setSelectedAnswer(choiceId);

    const isCorrect = choices.find((c) => c.id === choiceId)?.is_correct ?? false;
    const responseTime = Date.now() - questionStartRef.current;

    setAnsweredMap((prev) => ({
      ...prev,
      [sq.id]: { answer: choiceId, correct: isCorrect },
    }));

    await submitAnswer({
      sessionQuestionId: sq.id,
      sessionId: session.id,
      selectedAnswer: choiceId,
      isCorrect,
      responseTimeMs: responseTime,
    });

    setIsSubmitting(false);
  }

  async function handleNext() {
    if (currentIdx + 1 >= totalQuestions) {
      await completeSession(session.id);
      router.push(`/dashboard/quiz/${session.id}/summary`);
      return;
    }
    setSelectedAnswer(null);
    setCurrentIdx((prev) => prev + 1);
    questionStartRef.current = Date.now();
  }

  if (!sq || !question) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading question...</p>
      </div>
    );
  }

  const finalAnswer = answered?.answer ?? selectedAnswer;
  const correctChoice = choices.find((c) => c.is_correct);

  return (
    <div className="mx-auto max-w-[720px]">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono">Q {currentIdx + 1}/{totalQuestions}</span>
          <span className="font-mono">{Math.round((progress / totalQuestions) * 100)}%</span>
        </div>
        <div className="mt-1.5 h-1 w-full rounded-full bg-secondary">
          <div
            className="h-1 rounded-full bg-[var(--accent-blue)] transition-all duration-300"
            style={{ width: `${(progress / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-base font-medium leading-relaxed text-foreground">
          {question.prompt}
        </p>

        {question.prompt_image_url && (
          <img
            src={question.prompt_image_url}
            alt="Question illustration"
            className="mt-4 max-h-64 w-full rounded-lg object-contain"
          />
        )}

        {/* Choices */}
        <div className="mt-6 space-y-3">
          {choices.map((choice, i) => {
            const isSelected = finalAnswer === choice.id;
            const isCorrectChoice = choice.is_correct;
            let stateClass = "border-border bg-card hover:border-muted-foreground";

            if (isAnswered && showFeedback) {
              if (isCorrectChoice) {
                stateClass = "border-[var(--quiz-correct-border)] bg-[var(--quiz-correct-bg)]";
              } else if (isSelected && !isCorrectChoice) {
                stateClass = "border-[var(--quiz-wrong-border)] bg-[var(--quiz-wrong-bg)]";
              } else {
                stateClass = "border-border bg-card opacity-50";
              }
            } else if (isSelected) {
              stateClass = "border-[var(--quiz-selected-border)] bg-[var(--quiz-selected-bg)]";
            }

            return (
              <button
                key={choice.id}
                onClick={() => handleSelectAnswer(choice.id)}
                disabled={isAnswered}
                className={`flex min-h-[48px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${stateClass}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-foreground">{choice.text}</span>
                {isAnswered && showFeedback && isCorrectChoice && (
                  <Check className="h-4 w-4 shrink-0 text-[var(--success)]" strokeWidth={2} />
                )}
                {isAnswered && showFeedback && isSelected && !isCorrectChoice && (
                  <X className="h-4 w-4 shrink-0 text-[var(--danger)]" strokeWidth={2} />
                )}
              </button>
            );
          })}
        </div>

        {/* Post-Answer Feedback */}
        {isAnswered && showFeedback && (
          <div className="mt-6 space-y-4 border-t border-border pt-6">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[var(--success)]" strokeWidth={2} />
              <span className="text-sm font-medium text-foreground">
                Correct: {correctChoice?.text}
              </span>
            </div>

            {question.explanation && (
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-sm leading-relaxed text-foreground">{question.explanation}</p>
              </div>
            )}

            {question.explanation_image_url && (
              <img
                src={question.explanation_image_url}
                alt="Explanation diagram"
                className="max-h-48 w-full rounded-lg object-contain"
              />
            )}

            {question.references?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">References</p>
                {question.references.map((ref, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ExternalLink className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                    <span>{ref.title}{ref.page && ` — p. ${ref.page}`}</span>
                  </div>
                ))}
              </div>
            )}

            {question.fun_facts?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Fun Facts</p>
                {question.fun_facts.map((fact, i) => (
                  <div key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--warning)]" strokeWidth={1.5} />
                    <span>{fact}</span>
                  </div>
                ))}
              </div>
            )}

            {question.has_3d_component && (
              <Button variant="outline" size="sm" className="gap-2">
                <Box className="h-4 w-4" strokeWidth={1.5} />
                View 3D Model
              </Button>
            )}
          </div>
        )}

        {/* Next / Finish Button */}
        {isAnswered && (
          <div className="mt-6">
            <Button onClick={handleNext} className="w-full gap-2">
              {currentIdx + 1 >= totalQuestions ? "View Results" : "Next Question"}
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Keyboard: 1-4 for answers, Enter for next, Esc to exit
      </p>
    </div>
  );
}
