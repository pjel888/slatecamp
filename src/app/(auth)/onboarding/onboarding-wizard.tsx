"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Stethoscope,
  Scale,
  HardHat,
  Zap,
  ArrowRight,
  ArrowLeft,
  Check,
  Lock,
} from "lucide-react";
import type { BoardExam } from "@/types/app";

const EXAM_ICONS: Record<string, React.ElementType> = {
  "building-2": Building2,
  stethoscope: Stethoscope,
  gavel: Scale,
  "hard-hat": HardHat,
  cog: HardHat,
  zap: Zap,
};

const STEPS = ["Welcome", "Board Exam", "Target Date", "Ready"] as const;

interface OnboardingWizardProps {
  userId: string;
  boardExams?: BoardExam[];
}

export function OnboardingWizard({ userId, boardExams = [] }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedExam, setSelectedExam] = useState<BoardExam | null>(null);
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleComplete() {
    if (!selectedExam) return;
    setLoading(true);
    const supabase = createClient();

    // Deactivate any existing profiles
    await supabase
      .from("exam_profiles")
      .update({ is_active: false })
      .eq("user_id", userId);

    // Create new exam profile
    await supabase.from("exam_profiles").insert({
      user_id: userId,
      board_exam_id: selectedExam.id,
      target_exam_date: targetDate || null,
      is_active: true,
      onboarding_completed: true,
    });

    // Mark profile-level onboarding as completed
    await supabase
      .from("profiles")
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 w-8 rounded-full transition-all ${
              i <= step ? "bg-[var(--accent-blue)]" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Step 0: Welcome */}
      {step === 0 && (
        <div className="space-y-6 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome to Cerebro
          </h1>
          <p className="text-muted-foreground">
            Your second brain for board exams. Let&apos;s set up your review.
          </p>
          <Button onClick={() => setStep(1)} className="h-12 px-8">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step 1: Board Exam Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">
              Select your board exam
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose the exam you&apos;re preparing for
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
                  onClick={() => isAvailable && setSelectedExam(exam)}
                  disabled={!isAvailable}
                  className={`relative flex flex-col items-center gap-3 rounded-xl border p-5 transition-all ${
                    isSelected
                      ? "border-[var(--accent-blue)] bg-[var(--quiz-selected-bg)]"
                      : isAvailable
                        ? "border-border hover:border-muted-foreground"
                        : "border-border opacity-50"
                  }`}
                >
                  {!isAvailable && (
                    <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                      <Lock className="h-2.5 w-2.5 text-muted-foreground" strokeWidth={1.5} />
                      <span className="text-[9px] font-medium text-muted-foreground">
                        Coming Soon
                      </span>
                    </div>
                  )}
                  <Icon className="h-8 w-8" strokeWidth={1.5} />
                  <div className="text-center">
                    <span className="text-sm font-medium">{exam.short_name}</span>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {exam.country}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep(2)} disabled={!selectedExam}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Target Date */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">
              When is your exam?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This helps us pace your study plan. You can change this later.
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
            />
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep(3)}>
              {targetDate ? "Continue" : "Skip for now"}{" "}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 3 && (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success)]/10">
            <Check className="h-8 w-8 text-[var(--success)]" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            You&apos;re all set!
          </h2>
          <p className="text-muted-foreground">
            Your {selectedExam?.name} review starts now.
            {targetDate &&
              ` Your exam is in ${Math.ceil(
                (new Date(targetDate).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )} days.`}
          </p>
          <Button
            onClick={handleComplete}
            disabled={loading}
            className="h-12 px-8"
          >
            {loading ? "Setting up..." : "Go to Dashboard"}
          </Button>
        </div>
      )}
    </div>
  );
}
