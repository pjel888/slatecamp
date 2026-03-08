"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "./actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";

const COUNTS = [10, 25, 50, 100];

interface QuickStartFormProps {
  examProfileId: string;
  subjectId: string;
  subjectName: string;
}

export function QuickStartForm({ examProfileId, subjectId, subjectName }: QuickStartFormProps) {
  const router = useRouter();
  const [count, setCount] = useState(25);
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    const result = await createSession({
      examProfileId,
      sessionType: "subject_quick",
      sourceSubjectId: subjectId,
      config: {
        subjects: [{ subject_id: subjectId, question_count: count }],
        shuffle_questions: true,
        show_immediate_feedback: true,
      },
      name: `${subjectName} Quick Start`,
    });

    if (result.sessionId) {
      router.push(`/dashboard/quiz/${result.sessionId}`);
    } else {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <p className="text-sm font-medium text-foreground">{subjectName}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Select the number of questions
        </p>
      </div>

      <div className="flex gap-3">
        {COUNTS.map((c) => (
          <button
            key={c}
            onClick={() => setCount(c)}
            className={`flex-1 rounded-xl border py-3 text-center text-sm font-mono font-semibold transition-all ${
              count === c
                ? "border-[var(--accent-blue)] bg-[var(--quiz-selected-bg)] text-[var(--accent-blue)]"
                : "border-border text-muted-foreground hover:border-muted-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <Button onClick={handleStart} disabled={loading} className="w-full gap-2">
        <Play className="h-4 w-4" strokeWidth={1.5} />
        {loading ? "Creating..." : `Start ${count} Questions`}
      </Button>
    </Card>
  );
}
