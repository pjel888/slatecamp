"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReadinessGauge } from "@/components/shared/ReadinessGauge";
import {
  Building2,
  Stethoscope,
  Scale,
  HardHat,
  Zap,
  ArrowRight,
  ArrowLeft,
  Lock,
} from "lucide-react";
import {
  getDiagnosticQuestions,
  submitDiagnostic,
  skipDiagnosticAndComplete,
} from "@/lib/actions/onboarding";
import type { BoardExam, Question, Choice } from "@/types/app";

const EXAM_ICONS: Record<string, React.ElementType> = {
  "building-2": Building2,
  stethoscope: Stethoscope,
  gavel: Scale,
  "hard-hat": HardHat,
  cog: HardHat,
  zap: Zap,
};

interface OnboardingWizardProps {
  userId: string;
  boardExams?: BoardExam[];
}

type Step = "exam" | "date" | "diagnostic" | "result";

export function OnboardingWizard({ userId, boardExams = [] }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("exam");
  const [selectedExam, setSelectedExam] = useState<BoardExam | null>(null);
  const [targetDate, setTargetDate] = useState("");
  const [isPending, startTransition] = useTransition();

  // Diagnostic state
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<Question[]>([]);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<string, string>>({});
  const [currentDiagnosticIdx, setCurrentDiagnosticIdx] = useState(0);
  const [loadingDiagnostic, setLoadingDiagnostic] = useState(false);

  // Result state
  const [resultData, setResultData] = useState<{
    readinessScore: number;
    strongSubject: string;
    weakSubject: string;
    examProfileId: string;
  } | null>(null);

  const handleExamSelect = (exam: BoardExam) => {
    if (exam.has_content) setSelectedExam(exam);
  };

  const handleDateContinue = () => {
    if (!selectedExam) return;
    setLoadingDiagnostic(true);
    startTransition(async () => {
      const questions = await getDiagnosticQuestions(selectedExam.id, 10);
      setDiagnosticQuestions(questions);
      setLoadingDiagnostic(false);
      setStep("diagnostic");
    });
  };

  const handleDiagnosticAnswer = (questionId: string, choiceId: string) => {
    setDiagnosticAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  };

  const handleDiagnosticNext = () => {
    if (currentDiagnosticIdx < diagnosticQuestions.length - 1) {
      setCurrentDiagnosticIdx((prev) => prev + 1);
    }
  };

  const handleDiagnosticSubmit = () => {
    if (!selectedExam) return;
    startTransition(async () => {
      const answers = diagnosticQuestions.map((q) => {
        const selectedAnswer = diagnosticAnswers[q.id] ?? "";
        const correctIds = q.correct_answer.split(",").map((s) => s.trim());
        const isCorrect = correctIds.includes(selectedAnswer);
        return { questionId: q.id, selectedAnswer, isCorrect };
      });

      const result = await submitDiagnostic(
        userId,
        selectedExam.id,
        targetDate || null,
        answers
      );

      setResultData(result);
      setStep("result");
    });
  };

  const handleSkipDiagnostic = () => {
    if (!selectedExam) return;
    startTransition(async () => {
      await skipDiagnosticAndComplete(userId, selectedExam.id, targetDate || null);
      router.push("/dashboard");
      router.refresh();
    });
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
    router.refresh();
  };

  const stepIndex = step === "exam" ? 0 : step === "date" ? 1 : step === "diagnostic" ? 2 : 3;

  return (
    <div className="space-y-8">
      {/* Progress dots */}
      {step !== "result" && (
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-all duration-150 ${
                i <= stepIndex ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
      )}

      {/* Step 1: Pick Your Exam */}
      {step === "exam" && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground">
              Pick your exam
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose the board exam you&apos;re preparing for
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {boardExams.map((exam) => {
              const Icon = EXAM_ICONS[exam.icon_name ?? ""] ?? Building2;
              const isSelected = selectedExam?.id === exam.id;
              const isAvailable = exam.has_content;

              return (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => handleExamSelect(exam)}
                  disabled={!isAvailable}
                  className={`relative flex flex-col items-center gap-3 rounded-xl border p-5 transition-all duration-150 min-h-[100px] ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : isAvailable
                        ? "border-border hover:border-muted-foreground"
                        : "border-border opacity-50 cursor-not-allowed"
                  }`}
                >
                  {!isAvailable && (
                    <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                      <Lock className="h-2.5 w-2.5 text-muted-foreground" strokeWidth={1.5} />
                      <span className="text-[9px] font-medium text-muted-foreground">Soon</span>
                    </div>
                  )}
                  <Icon className="h-8 w-8" strokeWidth={1.5} />
                  <div className="text-center">
                    <span className="text-sm font-medium">{exam.short_name}</span>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{exam.country}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => setStep("date")}
              disabled={!selectedExam}
              className="h-11 px-6"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: When is your exam? */}
      {step === "date" && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">
              When is your exam?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This helps us pace your review. You can change this later.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-date">Exam date</Label>
            <Input
              id="target-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="h-11"
            />
          </div>
          <button
            type="button"
            onClick={() => setTargetDate("")}
            className="block text-sm text-muted-foreground underline"
          >
            I don&apos;t know yet
          </button>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep("exam")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleDateContinue}
              disabled={isPending || loadingDiagnostic}
              className="h-11 px-6"
            >
              {loadingDiagnostic ? "Loading..." : "Continue"}{" "}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Quick Diagnostic */}
      {step === "diagnostic" && diagnosticQuestions.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">
              Quick diagnostic
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {diagnosticQuestions.length} questions to gauge your level
            </p>
          </div>

          {/* Progress */}
          <div className="h-1 w-full rounded-full bg-border">
            <div
              className="h-1 rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${((Object.keys(diagnosticAnswers).length) / diagnosticQuestions.length) * 100}%`,
              }}
            />
          </div>

          {/* Current question */}
          {(() => {
            const q = diagnosticQuestions[currentDiagnosticIdx];
            if (!q) return null;
            const choices = (q.choices ?? []) as Choice[];
            const selectedId = diagnosticAnswers[q.id] ?? "";

            return (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Question {currentDiagnosticIdx + 1} of {diagnosticQuestions.length}
                </p>
                <p className="text-base font-medium leading-relaxed text-foreground">
                  {q.prompt}
                </p>
                <div className="space-y-2">
                  {choices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleDiagnosticAnswer(q.id, choice.id)}
                      className={`flex min-h-[48px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150 ${
                        selectedId === choice.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <span className="min-w-0 flex-1 text-sm text-foreground">
                        {choice.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (currentDiagnosticIdx > 0) {
                  setCurrentDiagnosticIdx((prev) => prev - 1);
                } else {
                  setStep("date");
                }
              }}
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>

            <div className="flex items-center gap-2">
              {currentDiagnosticIdx < diagnosticQuestions.length - 1 ? (
                <Button
                  onClick={handleDiagnosticNext}
                  disabled={!diagnosticAnswers[diagnosticQuestions[currentDiagnosticIdx]?.id]}
                  className="h-10"
                >
                  Next <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleDiagnosticSubmit}
                  disabled={
                    isPending ||
                    Object.keys(diagnosticAnswers).length < diagnosticQuestions.length
                  }
                  className="h-10"
                >
                  {isPending ? "Analyzing..." : "See my results"}
                </Button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSkipDiagnostic}
            disabled={isPending}
            className="block w-full text-center text-xs text-muted-foreground underline"
          >
            Skip diagnostic →
          </button>
        </div>
      )}

      {/* Result Screen */}
      {step === "result" && resultData && (
        <div className="space-y-8 text-center">
          <div className="flex justify-center">
            <ReadinessGauge
              score={resultData.readinessScore}
              size="lg"
              showLabel
              animateOnMount
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Your Readiness Score: {resultData.readinessScore}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              You&apos;re strongest in <strong>{resultData.strongSubject}</strong>.
              Focus on <strong>{resultData.weakSubject}</strong> first to improve fastest.
            </p>
          </div>

          <Button onClick={handleGoToDashboard} className="h-12 px-8">
            Start your first real session <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
