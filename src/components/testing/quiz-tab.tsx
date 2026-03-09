"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Play, ChevronRight, ArrowLeft } from "lucide-react";
import { QuizModeCards } from "@/app/dashboard/quiz/quiz-mode-cards";
import { QuickStartForm } from "@/app/dashboard/quiz/quick-start-form";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import type { Subject } from "@/types/app";

interface QuizTabProps {
  examProfileId: string;
  subjects: Subject[];
  initialQuickSubjectId?: string;
}

export function QuizTab({ examProfileId, subjects, initialQuickSubjectId }: QuizTabProps) {
  const [quickStartSubjectId, setQuickStartSubjectId] = useState<string | null>(
    initialQuickSubjectId ?? null
  );

  const quickSubject = quickStartSubjectId
    ? subjects.find((s) => s.id === quickStartSubjectId) ?? null
    : null;

  if (quickSubject) {
    return (
      <div className="mx-auto max-w-[600px] space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuickStartSubjectId(null)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Quick Start</h2>
            <p className="text-sm text-muted-foreground">
              Choose your settings and jump right in
            </p>
          </div>
        </div>
        <QuickStartForm
          examProfileId={examProfileId}
          subjectId={quickSubject.id}
          subjectName={quickSubject.short_name ?? quickSubject.name}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Start a session or build a custom quiz
        </p>
        <Link href="/dashboard/sessions/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Custom Session
          </Button>
        </Link>
      </div>

      <QuizModeCards />

      <section>
        <div className="mb-3 flex items-center gap-1.5">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Subject Quick Start
          </h2>
          <InfoTooltip content="Start a short quiz for one subject. Pick the number of questions and go." />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => setQuickStartSubjectId(subject.id)}
              className="text-left"
            >
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${subject.color ?? "#86868B"}15` }}
                  >
                    <Play
                      className="h-4 w-4"
                      style={{ color: subject.color ?? "#86868B" }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {subject.short_name ?? subject.name}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
