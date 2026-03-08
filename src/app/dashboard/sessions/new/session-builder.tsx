"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "@/app/dashboard/quiz/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Minus,
  Plus,
  Play,
} from "lucide-react";
import type { Subject, DifficultyMode } from "@/types/app";

interface SubjectSelection {
  subject_id: string;
  question_count: number;
}

const QUESTION_COUNTS = [5, 10, 15, 20, 25, 50];
const DIFFICULTIES: { value: DifficultyMode; label: string }[] = [
  { value: "mixed", label: "Mixed" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
];

interface SessionBuilderProps {
  examProfileId: string;
  subjects: Subject[];
}

export function SessionBuilder({ examProfileId, subjects }: SessionBuilderProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<SubjectSelection[]>([]);
  const [difficulty, setDifficulty] = useState<DifficultyMode>("mixed");
  const [timerMode, setTimerMode] = useState<"none" | "per_question" | "total">("none");
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [shuffle, setShuffle] = useState(true);
  const [showFeedback, setShowFeedback] = useState(true);
  const [loading, setLoading] = useState(false);

  const totalQuestions = selected.reduce((sum, s) => sum + s.question_count, 0);

  function toggleSubject(subjectId: string) {
    setSelected((prev) => {
      const exists = prev.find((s) => s.subject_id === subjectId);
      if (exists) return prev.filter((s) => s.subject_id !== subjectId);
      return [...prev, { subject_id: subjectId, question_count: 10 }];
    });
  }

  function updateCount(subjectId: string, delta: number) {
    setSelected((prev) =>
      prev.map((s) => {
        if (s.subject_id !== subjectId) return s;
        const currentIdx = QUESTION_COUNTS.indexOf(s.question_count);
        const newIdx = Math.max(0, Math.min(QUESTION_COUNTS.length - 1, currentIdx + delta));
        return { ...s, question_count: QUESTION_COUNTS[newIdx] };
      })
    );
  }

  async function handleStart() {
    if (selected.length === 0) return;
    setLoading(true);

    const config = {
      subjects: selected.map((s) => ({
        subject_id: s.subject_id,
        question_count: s.question_count,
        difficulty: difficulty === "mixed" ? undefined : difficulty,
      })),
      timer_mode: timerMode,
      timer_seconds: timerMode !== "none" ? timerSeconds : null,
      shuffle_questions: shuffle,
      show_immediate_feedback: showFeedback,
    };

    const result = await createSession({
      examProfileId,
      sessionType: "custom_compiled",
      config,
      name: name || undefined,
    });

    if (result.sessionId) {
      router.push(`/dashboard/quiz/${result.sessionId}`);
    } else {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[600px] space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">New Session</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Build a custom quiz from your subjects
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2">
        {["Name", "Subjects", "Settings", "Review"].map((label, i) => (
          <button
            key={label}
            onClick={() => i <= step && setStep(i)}
            className={`flex-1 rounded-full py-1.5 text-center text-xs font-medium transition-all ${
              i === step
                ? "bg-accent-blue text-white"
                : i < step
                  ? "bg-accent-blue/10 text-accent-blue"
                  : "bg-secondary text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Step 0: Name */}
      {step === 0 && (
        <Card className="p-6">
          <Label htmlFor="session-name">Session Name (optional)</Label>
          <Input
            id="session-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Building Tech + Structures Practice"
            className="mt-2"
          />
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setStep(1)}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 1: Subjects */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-3">
            {subjects.map((subject) => {
              const sel = selected.find((s) => s.subject_id === subject.id);
              const isSelected = !!sel;

              return (
                <Card
                  key={subject.id}
                  className={`overflow-hidden transition-all ${
                    isSelected ? "ring-1 ring-accent-blue" : ""
                  }`}
                >
                  <div className="flex items-center justify-between p-4">
                    <button
                      onClick={() => toggleSubject(subject.id)}
                      className="flex flex-1 items-center gap-3"
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                          isSelected
                            ? "border-accent-blue bg-accent-blue"
                            : "border-border"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={2} />}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {subject.name}
                      </span>
                    </button>

                    {isSelected && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCount(subject.id, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-secondary"
                        >
                          <Minus className="h-3 w-3" strokeWidth={1.5} />
                        </button>
                        <span className="w-8 text-center text-sm font-mono font-semibold">
                          {sel.question_count}
                        </span>
                        <button
                          onClick={() => updateCount(subject.id, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-secondary"
                        >
                          <Plus className="h-3 w-3" strokeWidth={1.5} />
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {totalQuestions > 0 && (
            <div className="rounded-lg bg-secondary p-3 text-center">
              <span className="text-sm font-medium text-foreground">
                Total: {totalQuestions} questions
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep(2)} disabled={selected.length === 0}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Settings */}
      {step === 2 && (
        <Card className="space-y-6 p-6">
          <div>
            <Label>Difficulty</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    difficulty === d.value
                      ? "bg-accent-blue text-white"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Timer</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["none", "per_question", "total"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTimerMode(mode)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    timerMode === mode
                      ? "bg-accent-blue text-white"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === "none" ? "No Timer" : mode === "per_question" ? "Per Question" : "Total"}
                </button>
              ))}
            </div>
            {timerMode !== "none" && (
              <div className="mt-3 flex items-center gap-2">
                {[30, 60, 90, 120].map((s) => (
                  <button
                    key={s}
                    onClick={() => setTimerSeconds(s)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-all ${
                      timerSeconds === s
                        ? "bg-foreground text-background"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label>Shuffle Questions</Label>
            <button
              onClick={() => setShuffle(!shuffle)}
              className={`h-6 w-11 rounded-full transition-all ${
                shuffle ? "bg-accent-blue" : "bg-border"
              }`}
            >
              <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                shuffle ? "translate-x-5" : "translate-x-0.5"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <Label>Show Immediate Feedback</Label>
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className={`h-6 w-11 rounded-full transition-all ${
                showFeedback ? "bg-accent-blue" : "bg-border"
              }`}
            >
              <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                showFeedback ? "translate-x-5" : "translate-x-0.5"
              }`} />
            </button>
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep(3)}>
              Review <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Review & Start */}
      {step === 3 && (
        <Card className="space-y-6 p-6">
          <div>
            <h3 className="text-base font-semibold text-foreground">Session Summary</h3>
            {name && <p className="mt-1 text-sm text-muted-foreground">{name}</p>}
          </div>

          <div className="space-y-2">
            {selected.map((s) => {
              const subject = subjects.find((sub) => sub.id === s.subject_id);
              return (
                <div key={s.subject_id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{subject?.name}</span>
                  <Badge variant="secondary" className="font-mono">
                    {s.question_count} Qs
                  </Badge>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg bg-secondary p-3 text-center">
            <span className="text-lg font-semibold text-foreground">{totalQuestions} questions</span>
            <span className="ml-2 text-sm text-muted-foreground">
              · {difficulty} · {timerMode === "none" ? "untimed" : `${timerSeconds}s ${timerMode === "per_question" ? "per Q" : "total"}`}
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="ghost" onClick={() => setStep(2)} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button onClick={handleStart} disabled={loading} className="flex-1 gap-2">
              <Play className="h-4 w-4" strokeWidth={1.5} />
              {loading ? "Creating..." : "Start Session"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
