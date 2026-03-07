"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROFESSIONS } from "@/lib/utils/constants";
import {
  PencilRuler,
  Stethoscope,
  Scale,
  HardHat,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import type { Profession } from "@/types/app";

const ICONS: Record<string, React.ElementType> = {
  "pencil-ruler": PencilRuler,
  stethoscope: Stethoscope,
  scale: Scale,
  "hard-hat": HardHat,
};

const STEPS = ["Welcome", "Profession", "Exam", "Target Date", "Ready"] as const;

export function OnboardingWizard({ userId }: { userId: string }) {
  const [step, setStep] = useState(0);
  const [profession, setProfession] = useState<Profession | null>(null);
  const [examTarget, setExamTarget] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const selectedProfession = PROFESSIONS.find((p) => p.value === profession);

  async function handleComplete() {
    setLoading(true);
    const supabase = createClient();

    await supabase
      .from("profiles")
      .update({
        profession: profession ?? "architecture",
        exam_target: examTarget,
        target_exam_date: targetDate || null,
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
              i <= step ? "bg-[var(--color-signal-amber)]" : "bg-border"
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
            Let&apos;s set up your review in less than a minute.
          </p>
          <Button onClick={() => setStep(1)} className="h-12 px-8">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step 1: Profession */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">
              What are you reviewing for?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select your profession
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {PROFESSIONS.map((p) => {
              const Icon = ICONS[p.icon] ?? PencilRuler;
              return (
                <button
                  key={p.value}
                  onClick={() => {
                    setProfession(p.value);
                    setExamTarget(null);
                  }}
                  className={`flex flex-col items-center gap-3 rounded-lg border p-6 transition-all ${
                    profession === p.value
                      ? "border-[var(--color-signal-amber)] bg-[var(--color-signal-amber)]/5"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <Icon className="h-8 w-8" strokeWidth={1.5} />
                  <span className="text-sm font-medium">{p.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep(2)} disabled={!profession}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Exam */}
      {step === 2 && selectedProfession && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">
              Which exam are you taking?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;ll tailor content to your specific exam
            </p>
          </div>
          <div className="space-y-3">
            {selectedProfession.exams.map((exam) => (
              <button
                key={exam.value}
                onClick={() => setExamTarget(exam.value)}
                className={`w-full rounded-lg border p-4 text-left transition-all ${
                  examTarget === exam.value
                    ? "border-[var(--color-signal-amber)] bg-[var(--color-signal-amber)]/5"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <span className="text-sm font-medium">{exam.label}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={!examTarget}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Target Date */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">
              When is your exam?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This helps us pace your study schedule. You can change this later.
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
            <Button variant="ghost" onClick={() => setStep(2)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep(4)}>
              {targetDate ? "Continue" : "Skip for now"}{" "}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Complete */}
      {step === 4 && (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-signal-green)]/10">
            <Check className="h-8 w-8 text-[var(--color-signal-green)]" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            You&apos;re all set!
          </h2>
          <p className="text-muted-foreground">
            Your {selectedProfession?.label} review starts now.
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
