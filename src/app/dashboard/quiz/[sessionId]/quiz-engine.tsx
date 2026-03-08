"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActiveSession } from "@/lib/context/active-session-context";
import { submitAnswer, completeSession, markQuestionPresented } from "../actions";
import { getQuestionSocialProof } from "@/lib/actions/social-proof";
import { AnswerResultStrip } from "@/components/quiz/answer-result-strip";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { Button } from "@/components/ui/button";
import { Check, X, ClipboardList, Play, Circle, CircleDot, Square, CheckSquare } from "lucide-react";
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
  const { setActiveSession } = useActiveSession();

  useEffect(() => {
    setActiveSession("quiz");
    return () => setActiveSession(null);
  }, [setActiveSession]);

  const [showIntro, setShowIntro] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(() => {
    const firstUnanswered = sessionQuestions.findIndex((sq) => !sq.answered_at);
    return firstUnanswered >= 0 ? firstUnanswered : 0;
  });
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
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | undefined>();
  const [questionSocialProof, setQuestionSocialProof] = useState<{
    weeklyAttempts: number;
    weeklyAccuracy: number;
  } | null>(null);
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

  useEffect(() => {
    setSelectedChoiceIds([]);
    setQuestionSocialProof(null);
  }, [currentIdx]);

  useEffect(() => {
    if (isAnswered && question?.id) {
      getQuestionSocialProof(question.id).then(setQuestionSocialProof);
    }
  }, [isAnswered, question?.id]);

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
    setLastAnswerCorrect(correct);

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
      if (!question || showIntro) return;

      // B = Bookmark
      if (e.key === "b" || e.key === "B") {
        // Bookmark functionality placeholder
        return;
      }

      // Escape = Pause/Exit
      if (e.key === "Escape") {
        router.push("/dashboard/sessions");
        return;
      }

      if (isAnswered) {
        // Enter or Space = Next question
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNext();
        }
        return;
      }

      // 1-4 = Select answer
      if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (choices[idx]) toggleChoice(choices[idx].id);
        return;
      }

      // Enter = Confirm selection
      if (e.key === "Enter" && canCheckAnswer) {
        handleCheckAnswer();
      }
    },
    [question, showIntro, isAnswered, choices, canCheckAnswer, toggleChoice, handleNext, handleCheckAnswer, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Intro screen
  if (showIntro) {
    const sessionLabel = session.name ?? SESSION_TYPE_LABELS[session.session_type] ?? "Quiz";
    const subjectCount = session.config?.subjects?.length ?? 0;
    return (
      <div className="mx-auto flex max-w-[520px] flex-col items-center rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ClipboardList className="h-12 w-12" strokeWidth={1.5} />
        </div>
        <h1 className="mt-6 text-xl font-semibold text-foreground">Good luck!</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          You&apos;re about to start your session. Here&apos;s a quick recap.
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
    <>
      <div className="mx-auto flex max-w-[720px] flex-col pb-8">
        {/* Question card */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {/* Progress on top of quiz card: bar + "Question X of Y" */}
          <QuizProgress
            current={progress}
            total={totalQuestions}
            currentQuestionIndex={currentIdx + 1}
            lastAnswerCorrect={lastAnswerCorrect}
            inline
          />
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            {/* Fixed image slot — 1920×1080 landscape (16:9) above question */}
            <div className="relative mb-4 flex w-full shrink-0 aspect-video items-center justify-center overflow-hidden rounded-xl bg-muted/30">
              {question.prompt_image_url ? (
                <Image
                  src={question.prompt_image_url}
                  alt="Question illustration"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 720px"
                />
              ) : (
                <span className="text-xs text-muted-foreground/60">Image</span>
              )}
            </div>

            {/* Prompt */}
            <div className="min-h-14">
              <p className="text-base font-medium leading-relaxed text-foreground">
                {question.prompt}
              </p>
            </div>

            {/* Explanation result — on top of options (fixed height, fills after answer) */}
            <AnswerResultStrip
              isAnswered={isAnswered}
              correct={!!answered?.correct}
              correctChoiceText={correctChoiceText}
              question={question}
              showSeeMore={showFeedback}
              socialProof={questionSocialProof}
            />

            {/* Choices with PRD visual states */}
            <div className="mt-6 space-y-3">
              {choices.map((choice, i) => {
                const isSelected = displayedSelection.includes(choice.id);
                const isCorrectChoice = choice.is_correct;
                const isWrongSelected = isSelected && !isCorrectChoice && isAnswered;

                let stateClass: string;
                let iconElement: React.ReactNode = null;

                if (isAnswered && showFeedback) {
                  if (isCorrectChoice) {
                    // Correct answer: green treatment
                    stateClass = "border-2 border-(--quiz-correct-border) bg-(--quiz-correct-bg)";
                    iconElement = <Check className="h-4 w-4 shrink-0 text-(--color-signal-green)" strokeWidth={2} />;
                  } else if (isWrongSelected) {
                    // Wrong choice selected: red, dimmed
                    stateClass = "border-2 border-(--quiz-wrong-border) bg-(--quiz-wrong-bg) opacity-70";
                    iconElement = <X className="h-4 w-4 shrink-0 text-(--color-signal-red)" strokeWidth={2} />;
                  } else {
                    // Other unselected: muted
                    stateClass = "border border-border bg-card opacity-50";
                  }
                } else if (isSelected) {
                  // Selected before submit: amber
                  stateClass = "border-2 border-primary bg-primary/5";
                } else {
                  // Default: white/surface
                  stateClass = "border border-border bg-card hover:bg-muted/50 hover:border-muted-foreground/50";
                }

                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => toggleChoice(choice.id)}
                    disabled={isAnswered}
                    role={isMultiSelect ? "checkbox" : "radio"}
                    aria-checked={isSelected}
                    className={`flex min-h-[56px] w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-150 ${stateClass}`}
                  >
                    {isMultiSelect ? (
                      isSelected ? (
                        <CheckSquare className="h-5 w-5 shrink-0 text-primary" strokeWidth={2} aria-hidden />
                      ) : (
                        <Square className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden />
                      )
                    ) : isSelected ? (
                      <CircleDot className="h-5 w-5 shrink-0 text-primary" strokeWidth={2} aria-hidden />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden />
                    )}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-current/20 text-xs font-semibold text-muted-foreground">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="min-w-0 flex-1 text-sm text-foreground line-clamp-2">{choice.text}</span>
                    {iconElement}
                  </button>
                );
              })}
            </div>

            {/* Action row: Check Answer and Next always both shown */}
            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleCheckAnswer}
                disabled={isAnswered || !canCheckAnswer || isSubmitting}
                variant={!isAnswered && canCheckAnswer ? "default" : "outline"}
                className="min-h-12 flex-1 gap-2 text-base font-semibold"
              >
                <Check className="h-5 w-5" strokeWidth={2} />
                {isSubmitting ? "Checking..." : "Check Answer"}
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isAnswered}
                variant={isAnswered ? "default" : "outline"}
                className="min-h-12 flex-1 gap-2 text-base font-semibold"
              >
                {currentIdx + 1 >= totalQuestions ? "View Results" : "Next →"}
              </Button>
            </div>
          </div>
        </div>

        {/* Keyboard hint */}
        <p className="mt-4 shrink-0 text-center text-xs text-muted-foreground">
          {isAnswered
            ? "Enter/Space → Next · B → Bookmark · Esc → Exit"
            : "1–4 → Select · Enter → Check · B → Bookmark · Esc → Exit"}
        </p>
      </div>
    </>
  );
}
