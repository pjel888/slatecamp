"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { fetchReviewQuestions, logReviewInteraction } from "./actions";
import { Button } from "@/components/ui/button";
import { ChevronUp, Check, X, BookOpen, ExternalLink, Lightbulb, Box } from "lucide-react";
import type { Question, Subject, Choice } from "@/types/app";

interface ReviewFeedProps {
  examProfileId: string;
  subjects: Subject[];
  initialSubjectId: string | null;
  initialQuestions: Question[];
}

export function ReviewFeed({
  examProfileId,
  subjects,
  initialSubjectId,
  initialQuestions,
}: ReviewFeedProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions as Question[]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(initialSubjectId);
  const [cursor, setCursor] = useState<string | null>(
    initialQuestions.length > 0
      ? initialQuestions[initialQuestions.length - 1].created_at
      : null
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const questionStartTime = useRef(Date.now());

  const currentQuestion = questions[currentIndex] as Question | undefined;
  const isAnswered = selectedAnswer !== null;
  const choices = (currentQuestion?.choices ?? []) as Choice[];
  const correctChoice = choices.find((c) => c.is_correct);

  const loadMore = useCallback(async () => {
    if (loadingMore || !cursor) return;
    setLoadingMore(true);
    const result = await fetchReviewQuestions({
      examProfileId,
      subjectId: subjectFilter ?? undefined,
      cursor,
      limit: 10,
    });
    setQuestions((prev) => [...prev, ...(result.questions as Question[])]);
    setCursor(result.nextCursor);
    setLoadingMore(false);
  }, [examProfileId, subjectFilter, cursor, loadingMore]);

  useEffect(() => {
    if (currentIndex >= questions.length - 3) {
      loadMore();
    }
  }, [currentIndex, questions.length, loadMore]);

  function handleSelectAnswer(choiceId: string) {
    if (isAnswered || !currentQuestion) return;
    setSelectedAnswer(choiceId);

    const isCorrect = choices.find((c) => c.id === choiceId)?.is_correct ?? false;
    const timeMs = Date.now() - questionStartTime.current;

    logReviewInteraction({
      examProfileId,
      questionId: currentQuestion.id,
      initialTapCorrect: isCorrect,
      timeOnQuestionMs: timeMs,
    });
  }

  function handleNext() {
    setSelectedAnswer(null);
    setCurrentIndex((prev) => prev + 1);
    questionStartTime.current = Date.now();
  }

  async function handleSubjectChange(subjectId: string | null) {
    setSubjectFilter(subjectId);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setCursor(null);

    const result = await fetchReviewQuestions({
      examProfileId,
      subjectId: subjectId ?? undefined,
      limit: 10,
    });
    setQuestions(result.questions as Question[]);
    setCursor(result.nextCursor);
    questionStartTime.current = Date.now();
  }

  if (!currentQuestion) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">No questions available yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px]">
      {/* Subject Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleSubjectChange(null)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
            !subjectFilter
              ? "bg-[var(--accent-blue)] text-white"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          All Subjects
        </button>
        {subjects.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSubjectChange(s.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              subjectFilter === s.id
                ? "bg-[var(--accent-blue)] text-white"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.short_name ?? s.name}
          </button>
        ))}
      </div>

      {/* Question Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        {/* Prompt */}
        <p className="text-base font-medium leading-relaxed text-foreground">
          {currentQuestion.prompt}
        </p>

        {currentQuestion.prompt_image_url && (
          <img
            src={currentQuestion.prompt_image_url}
            alt="Question illustration"
            className="mt-4 max-h-64 w-full rounded-lg object-contain"
          />
        )}

        {/* Choices */}
        <div className="mt-6 space-y-3">
          {choices.map((choice, i) => {
            const isSelected = selectedAnswer === choice.id;
            const isCorrectChoice = choice.is_correct;
            let stateClass = "border-border bg-card hover:border-muted-foreground";

            if (isAnswered) {
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
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 text-sm text-foreground">{choice.text}</span>
                {isAnswered && isCorrectChoice && (
                  <Check className="h-4 w-4 shrink-0 text-[var(--success)]" strokeWidth={2} />
                )}
                {isAnswered && isSelected && !isCorrectChoice && (
                  <X className="h-4 w-4 shrink-0 text-[var(--danger)]" strokeWidth={2} />
                )}
              </button>
            );
          })}
        </div>

        {/* Post-Answer Panel */}
        {isAnswered && (
          <div className="mt-6 space-y-4 border-t border-border pt-6">
            {/* Correct Answer */}
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[var(--success)]" strokeWidth={2} />
              <span className="text-sm font-medium text-foreground">
                Correct: {correctChoice?.text}
              </span>
            </div>

            {/* Explanation */}
            {currentQuestion.explanation && (
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-sm leading-relaxed text-foreground">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {currentQuestion.explanation_image_url && (
              <img
                src={currentQuestion.explanation_image_url}
                alt="Explanation diagram"
                className="max-h-48 w-full rounded-lg object-contain"
              />
            )}

            {/* References */}
            {currentQuestion.references?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  References
                </p>
                <div className="space-y-1.5">
                  {currentQuestion.references.map((ref, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ExternalLink className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                      <span>
                        {ref.title}
                        {ref.page && ` — p. ${ref.page}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fun Facts */}
            {currentQuestion.fun_facts?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Fun Facts
                </p>
                <div className="space-y-2">
                  {currentQuestion.fun_facts.map((fact, i) => (
                    <div key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--warning)]" strokeWidth={1.5} />
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mnemonics */}
            {currentQuestion.mnemonics && (
              <div className="rounded-lg border border-[var(--warning)]/20 bg-[var(--warning)]/5 p-3">
                <p className="text-xs font-medium text-[var(--warning)]">Mnemonic</p>
                <p className="mt-1 text-sm text-foreground">{currentQuestion.mnemonics}</p>
              </div>
            )}

            {/* 3D Link */}
            {currentQuestion.has_3d_component && (
              <Button variant="outline" size="sm" className="gap-2">
                <Box className="h-4 w-4" strokeWidth={1.5} />
                See in 3D
              </Button>
            )}

            {/* Next Button */}
            <Button onClick={handleNext} className="w-full gap-2">
              Next Question <ChevronUp className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
