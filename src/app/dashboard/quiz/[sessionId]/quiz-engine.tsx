"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { submitAnswer, completeSession, markQuestionPresented } from "../actions";
import { AnswerResultStrip } from "@/components/quiz/answer-result-strip";
import { Button } from "@/components/ui/button";
import { Check, X, ChevronRight, ClipboardList, Play } from "lucide-react";
import type { ReviewSession, SessionQuestion, Question, Choice } from "@/types/app";

const SESSION_TYPE_LABELS: Record<string, string> = {
  subject_quick: "Quick Start",
  custom_compiled: "Custom Session",
  srs_review: "SRS Review",
  ai_adaptive: "AI Adaptive",
  retake: "Retake",
  topic_drill: "Topic Drill",
  "3d_model_quiz": "3D Quiz",
  weak_areas: "Weak Areas",
};

/** Compare selected choice IDs to question correct_answer (single id or comma-separated). */
function isSelectionCorrect(selectedIds: string[], correctAnswer: string): boolean {
  const correctSet = new Set(correctAnswer.split(",").map((s) => s.trim()));
  const selectedSet = new Set(selectedIds);
  if (correctSet.size !== selectedSet.size) return false;
  return [...correctSet].every((id) => selectedSet.has(id));
}

interface QuizEngineProps {
  session: ReviewSession;
  sessionQuestions: SessionQuestion[];
}

export function QuizEngine({ session, sessionQuestions }: QuizEngineProps) {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(() => {
    const firstUnanswered = sessionQuestions.findIndex((sq) => !sq.answered_at);
    return firstUnanswered >= 0 ? firstUnanswered : 0;
  });
  /** Current selection (before "Check Answer"). Multi-select = multiple ids; single = one or none. */
  const [selectedChoiceIds, setSelectedChoiceIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answeredMap, setAnsweredMap] = useState<Record<string, { answer: string; correct: boolean }>>(() => {
    const map: Record<string, { answer: string; correct: boolean }> = {};
    for (const sq of sessionQuestions) {
      if (sq.selected_answer != null && sq.is_correct !== null) {
        map[sq.id] = { answer: sq.selected_answer, correct: sq.is_correct };
      }
    }
    return map;
  });
  const questionStartRef = useRef(0);

  const sq = sessionQuestions[currentIdx];
  const question = sq?.questions as Question | undefined;
  const choices = useMemo(() => (question?.choices ?? []) as Choice[], [question?.choices]);
  const isMultiSelect = question?.is_multi_select ?? false;
  const answered = sq ? answeredMap[sq.id] : undefined;
  const isAnswered = !!answered;
  const showFeedback = session.config.show_immediate_feedback !== false;
  const totalQuestions = sessionQuestions.length;
  const progress = Object.keys(answeredMap).length;
  const canCheckAnswer = selectedChoiceIds.length > 0 && !isAnswered;

  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [currentIdx]);

  useEffect(() => {
    if (sq && !sq.presented_at) {
      markQuestionPresented(sq.id);
    }
  }, [sq]);

  /** Reset selection when moving to a new question */
  useEffect(() => {
    setSelectedChoiceIds([]);
  }, [currentIdx]);

  const toggleChoice = useCallback(
    (choiceId: string) => {
      if (isAnswered || !question) return;
      setSelectedChoiceIds((prev) => {
        if (isMultiSelect) {
          return prev.includes(choiceId) ? prev.filter((id) => id !== choiceId) : [...prev, choiceId];
        }
        return prev[0] === choiceId ? [] : [choiceId];
      });
    },
    [isAnswered, question, isMultiSelect]
  );

  const handleCheckAnswer = useCallback(async () => {
    if (!sq || !question || !canCheckAnswer || isSubmitting) return;
    setIsSubmitting(true);
    const answerString = selectedChoiceIds.slice().sort().join(",");
    const correct = isSelectionCorrect(selectedChoiceIds, question.correct_answer ?? "");
    const responseTime = Date.now() - questionStartRef.current;

    setAnsweredMap((prev) => ({ ...prev, [sq.id]: { answer: answerString, correct } }));

    await submitAnswer({
      sessionQuestionId: sq.id,
      sessionId: session.id,
      selectedAnswer: answerString,
      isCorrect: correct,
      responseTimeMs: responseTime,
    });

    setIsSubmitting(false);
  }, [sq, question, canCheckAnswer, isSubmitting, selectedChoiceIds, session.id]);

  const handleNext = useCallback(async () => {
    if (currentIdx + 1 >= totalQuestions) {
      await completeSession(session.id);
      router.push(`/dashboard/quiz/${session.id}/summary`);
      return;
    }
    setSelectedChoiceIds([]);
    setCurrentIdx((prev) => prev + 1);
    questionStartRef.current = Date.now();
  }, [currentIdx, totalQuestions, session.id, router]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!question) return;
      if (e.key === "Escape") {
        router.push("/dashboard/sessions");
        return;
      }
      if (isAnswered) {
        if (e.key === "Enter") handleNext();
        return;
      }
      if (["1", "2", "3", "4", "5", "6"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (choices[idx]) toggleChoice(choices[idx].id);
        return;
      }
      if (e.key === "Enter" && canCheckAnswer) {
        handleCheckAnswer();
      }
    },
    [question, isAnswered, choices, canCheckAnswer, toggleChoice, handleNext, handleCheckAnswer, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (showIntro) {
    const sessionLabel = session.name ?? SESSION_TYPE_LABELS[session.session_type] ?? "Quiz";
    const subjectCount = session.config?.subjects?.length ?? 0;
    return (
      <div className="mx-auto flex max-w-[520px] flex-col items-center rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-amber/10 text-amber">
          <ClipboardList className="h-12 w-12" strokeWidth={1.5} />
        </div>
        <h1 className="mt-6 text-xl font-semibold text-foreground">Good luck in taking this exam!</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          You’re about to start your session. Here’s a quick recap.
        </p>
        <div className="mt-6 w-full space-y-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Session</span>
            <span className="font-medium text-foreground">{sessionLabel}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Questions</span>
            <span className="font-medium text-foreground">{sessionQuestions.length}</span>
          </div>
          {subjectCount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subjects</span>
              <span className="font-medium text-foreground">{subjectCount}</span>
            </div>
          )}
        </div>
        <Button
          size="lg"
          className="mt-8 h-12 gap-2 px-8 text-base"
          onClick={() => setShowIntro(false)}
        >
          <Play className="h-5 w-5" strokeWidth={1.5} />
          Start test
        </Button>
      </div>
    );
  }

  if (!sq || !question) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading question...</p>
      </div>
    );
  }

  const displayedSelection = isAnswered ? (answered.answer?.split(",") ?? []) : selectedChoiceIds;
  const correctChoiceIds = (question.correct_answer ?? "").split(",").map((s) => s.trim());
  const correctChoices = choices.filter((c) => correctChoiceIds.includes(c.id));
  const correctChoiceText = correctChoices.map((c) => c.text).join(", ");

  return (
    <div className="mx-auto flex max-w-[720px] flex-col">
      {/* Progress Bar */}
      <div className="mb-4 shrink-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono">Q {currentIdx + 1}/{totalQuestions}</span>
          <span className="font-mono">{Math.round((progress / totalQuestions) * 100)}%</span>
        </div>
        <div className="mt-1.5 h-1 w-full rounded-full bg-secondary">
          <div
            className="h-1 rounded-full bg-accent-blue transition-all duration-300"
            style={{ width: `${(progress / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card: fixed structure so layout doesn't shift */}
      <div className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Scrollable body: prompt + image slot + choices + feedback */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {/* Prompt — min height so short questions don't collapse */}
          <div className="min-h-14">
            <p className="text-base font-medium leading-relaxed text-foreground">
              {question.prompt}
            </p>
          </div>

          {/* Fixed-height image slot: always same space, image or placeholder */}
          <div className="relative mt-4 flex h-52 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted/30">
            {question.prompt_image_url ? (
              <Image
                src={question.prompt_image_url}
                alt="Question illustration"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 720px"
              />
            ) : (
              <span className="text-xs text-muted-foreground/50">No image</span>
            )}
          </div>

          <AnswerResultStrip
            isAnswered={isAnswered}
            correct={!!answered?.correct}
            correctChoiceText={correctChoiceText}
            question={question}
            showSeeMore={showFeedback}
          />

          {/* Choices — fixed min height for 4 options so layout is stable */}
          <div className="mt-6 min-h-[248px] space-y-3">
            {choices.map((choice, i) => {
              const isSelected = displayedSelection.includes(choice.id);
              const isCorrectChoice = choice.is_correct;
              let stateClass = "border-border bg-card hover:border-muted-foreground transition-all duration-150";

              if (isAnswered && showFeedback) {
                if (isCorrectChoice) {
                  stateClass = "border-quiz-correct-border bg-quiz-correct-bg";
                } else if (isSelected && !isCorrectChoice) {
                  stateClass = "border-quiz-wrong-border bg-quiz-wrong-bg";
                } else {
                  stateClass = "border-border bg-card opacity-50";
                }
              } else if (isSelected) {
                stateClass = "border-accent-blue bg-quiz-selected-bg";
              }

              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => toggleChoice(choice.id)}
                  disabled={isAnswered}
                  className={`flex min-h-[56px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left ${stateClass}`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-current/20 text-xs font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-foreground line-clamp-2">{choice.text}</span>
                  {isAnswered && showFeedback && isCorrectChoice && (
                    <Check className="h-5 w-5 shrink-0 text-success" strokeWidth={2} />
                  )}
                  {isAnswered && showFeedback && isSelected && !isCorrectChoice && (
                    <X className="h-5 w-5 shrink-0 text-danger" strokeWidth={2} />
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Fixed action bar — both buttons visible; Check disabled when no selection or after answer; Next disabled until after Check */}
        <div className="shrink-0 border-t border-border bg-card px-6 py-4">
          {selectedChoiceIds.length > 0 && !isAnswered && (
            <p className="mb-2 text-center text-xs text-muted-foreground">
              {isMultiSelect ? "You can select multiple options." : "Tap an option to change your answer."}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleCheckAnswer}
              disabled={!canCheckAnswer || isSubmitting || isAnswered}
              className="h-11 gap-2 text-sm font-medium"
              variant="outline"
            >
              <Check className="h-4 w-4" strokeWidth={2} />
              {isSubmitting ? "Checking…" : "Check Answer"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isAnswered}
              className="h-11 gap-2 text-sm font-medium"
            >
              {currentIdx + 1 >= totalQuestions ? "View Results" : "Next Question"}
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </div>

      {/* Keyboard hint */}
      <p className="mt-4 shrink-0 text-center text-xs text-muted-foreground">
        {isAnswered
          ? "Enter → Next question · Esc → Exit"
          : "1–4 → Select option · Enter → Check answer · Esc → Exit"}
      </p>
    </div>
  );
}
