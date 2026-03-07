"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { submitAnswer, completeSession } from "../actions";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizTimer } from "@/components/quiz/QuizTimer";
import { FeedbackPanel } from "@/components/quiz/FeedbackPanel";
import { SessionSummary } from "@/components/quiz/SessionSummary";
import { Button } from "@/components/ui/button";
import { X, Check, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Question, Choice } from "@/types/app";

interface Props {
  sessionId: string;
  questions: Question[];
  timerMinutes?: number;
}

interface SessionResult {
  total: number;
  correct: number;
  totalTime: number;
  scorePercentage: number;
}

export function QuizSession({ sessionId, questions, timerMinutes }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, { selected: string; correct: boolean }>>({});
  const [submitting, setSubmitting] = useState(false);
  const questionStartTime = useRef(Date.now());
  const router = useRouter();

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isMultiSelect = currentQuestion?.is_multi_select ?? false;
  const hasSelection = selectedAnswers.length > 0;

  const handleSelectAnswer = useCallback(
    (choiceId: string) => {
      if (isConfirmed) return;

      if (isMultiSelect) {
        setSelectedAnswers((prev) =>
          prev.includes(choiceId)
            ? prev.filter((id) => id !== choiceId)
            : [...prev, choiceId]
        );
      } else {
        setSelectedAnswers([choiceId]);
      }
    },
    [isConfirmed, isMultiSelect]
  );

  const handleConfirm = useCallback(async () => {
    if (!currentQuestion || selectedAnswers.length === 0 || submitting) return;
    setSubmitting(true);

    const responseTimeMs = Date.now() - questionStartTime.current;
    const selected = [...selectedAnswers].sort().join(",");

    const formData = new FormData();
    formData.set("questionId", currentQuestion.id);
    formData.set("sessionId", sessionId);
    formData.set("selectedAnswer", selected);
    formData.set("responseTimeMs", String(responseTimeMs));
    formData.set("correctAnswer", currentQuestion.correct_answer);
    formData.set("examDomainId", currentQuestion.exam_domain_id ?? "");

    const result = await submitAnswer(formData);
    setIsCorrect(result.isCorrect);
    setIsConfirmed(true);
    setStreak(result.isCorrect ? (s) => s + 1 : 0);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { selected, correct: result.isCorrect },
    }));
    setSubmitting(false);
  }, [currentQuestion, selectedAnswers, sessionId, submitting]);

  const handleNext = useCallback(async () => {
    if (isLastQuestion) {
      const result = await completeSession(sessionId);
      setSessionResult(result);
      setSessionComplete(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswers([]);
    setIsConfirmed(false);
    setIsCorrect(null);
    questionStartTime.current = Date.now();
  }, [isLastQuestion, sessionId]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
        return;

      if (!isConfirmed && currentQuestion?.choices) {
        const choices = currentQuestion.choices as Choice[];
        const keyIndex = Number(e.key) - 1;
        if (keyIndex >= 0 && keyIndex < choices.length) {
          handleSelectAnswer(choices[keyIndex].id);
        }
      }

      if (!isConfirmed && hasSelection && e.key === "Enter") {
        handleConfirm();
      } else if (isConfirmed && e.key === "Enter") {
        handleNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isConfirmed, hasSelection, currentQuestion, handleSelectAnswer, handleConfirm, handleNext]);

  if (sessionComplete && sessionResult) {
    return (
      <SessionSummary
        result={sessionResult}
        answers={answers}
        questions={questions}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">No questions available.</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-[720px]">
      <QuizProgress current={currentIndex + 1} total={questions.length} />

      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setShowExitDialog(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <span className="rounded-lg bg-secondary px-3 py-1 text-[13px] font-medium tabular-nums text-muted-foreground">
          {currentIndex + 1} / {questions.length}
        </span>

        {timerMinutes && <QuizTimer minutes={timerMinutes} onExpire={handleConfirm} />}
      </div>

      {/* Question */}
      <QuestionCard
        question={currentQuestion}
        selectedAnswers={selectedAnswers}
        isConfirmed={isConfirmed}
        onSelectAnswer={handleSelectAnswer}
      />

      {/* Feedback */}
      {isConfirmed && isCorrect !== null && (
        <FeedbackPanel
          isCorrect={isCorrect}
          correctAnswer={currentQuestion.correct_answer}
          explanation={currentQuestion.explanation}
          choices={currentQuestion.choices as Choice[]}
          isMultiSelect={isMultiSelect}
          streak={streak}
        />
      )}

      {/* Action buttons */}
      <div className="mt-6 flex justify-end gap-3">
        {!isConfirmed && hasSelection && (
          <Button
            onClick={handleConfirm}
            disabled={submitting}
            size="lg"
            className="h-11 rounded-xl px-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
          >
            {submitting ? "Checking..." : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Check Answer
              </>
            )}
          </Button>
        )}
        {isConfirmed && (
          <Button
            onClick={handleNext}
            size="lg"
            className="h-11 rounded-xl px-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
          >
            {isLastQuestion ? "Finish" : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Exit dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit quiz?</DialogTitle>
            <DialogDescription>
              You&apos;ve completed {Object.keys(answers).length} of {questions.length} questions.
              Your progress has been saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              Continue Quiz
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await completeSession(sessionId);
                router.push("/dashboard/quiz");
              }}
            >
              Exit & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
