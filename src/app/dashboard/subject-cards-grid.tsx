"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, BookOpen } from "lucide-react";
import Link from "next/link";
import type { Subject, SubjectMastery } from "@/types/app";

interface SubjectCardsGridProps {
  subjects: Subject[];
  masteries: SubjectMastery[];
  questionCounts: Record<string, number>;
  examProfileId: string;
}

export function SubjectCardsGrid({
  subjects,
  masteries,
  questionCounts,
}: SubjectCardsGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {subjects.map((subject) => {
        const mastery = masteries.find((m) => m.subject_id === subject.id);
        const qCount = questionCounts[subject.id] ?? 0;
        const masteryPct = mastery ? Math.round(mastery.mastery_score) : null;

        return (
          <Card
            key={subject.id}
            className="group relative overflow-hidden transition-shadow hover:shadow-md"
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${subject.color ?? "#86868B"}15` }}
                  >
                    <BookOpen
                      className="h-5 w-5"
                      style={{ color: subject.color ?? "#86868B" }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {subject.short_name ?? subject.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {qCount} questions
                    </p>
                  </div>
                </div>
                {masteryPct !== null && (
                  <div className="text-right">
                    <span className="text-lg font-semibold font-mono text-foreground">
                      {masteryPct}%
                    </span>
                    <p className="text-[10px] text-muted-foreground">mastery</p>
                  </div>
                )}
              </div>

              {mastery && (
                <div className="mt-3">
                  <div className="h-1.5 w-full rounded-full bg-secondary">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(mastery.mastery_score, 100)}%`,
                        backgroundColor: subject.color ?? "var(--accent-blue)",
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Link href={`/dashboard/review?subject=${subject.id}`} className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                  >
                    <BookOpen className="mr-1.5 h-3 w-3" strokeWidth={1.5} />
                    Review
                  </Button>
                </Link>
                <Link href={`/dashboard/quiz?subject=${subject.id}&quick=true`} className="flex-1">
                  <Button
                    size="sm"
                    className="w-full text-xs"
                  >
                    <Play className="mr-1.5 h-3 w-3" strokeWidth={1.5} />
                    Quick Start
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
