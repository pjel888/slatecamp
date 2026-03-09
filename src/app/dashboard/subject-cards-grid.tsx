"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, BookOpen, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { FALLBACK_SUBJECT_COLOR } from "@/lib/constants";
import type { Subject, SubjectMastery, UserTier } from "@/types/app";

const SOCIAL_PROOF_MIN = 5;

interface SubjectCardsGridProps {
  subjects: Subject[];
  masteries: SubjectMastery[];
  questionCounts: Record<string, number>;
  examProfileId: string;
  tier?: UserTier;
  /** Optional: daily studier counts per subject (for social proof when >= 5) */
  dailyStudiers?: Record<string, number>;
}

export function SubjectCardsGrid({
  subjects,
  masteries,
  questionCounts,
  tier = "free",
  dailyStudiers,
}: SubjectCardsGridProps) {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
      {subjects.map((subject) => {
        const mastery = masteries.find((m) => m.subject_id === subject.id);
        const qCount = questionCounts[subject.id] ?? 0;
        const masteryPct = mastery ? Math.round(mastery.mastery_score) : null;
        const studiers = dailyStudiers?.[subject.id] ?? 0;
        const subjectName = subject.short_name ?? subject.name;

        return (
          <Card
            key={subject.id}
            className="group relative overflow-hidden transition-shadow duration-150 hover:shadow-md"
          >
            <div className="p-3 sm:p-4">
              {/* Subject icon + name + urgency (Final Stretch: red < 55%, green > 75%) */}
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${subject.color ?? FALLBACK_SUBJECT_COLOR}15` }}
                  >
                  <BookOpen
                    className="h-4 w-4"
                    style={{ color: subject.color ?? FALLBACK_SUBJECT_COLOR }}
                    strokeWidth={1.5}
                  />
                  </div>
                  {tier !== "free" && masteryPct != null && (
                    <>
                      {masteryPct < 55 && (
                        <span
                          className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-danger"
                          title="Needs focus"
                        />
                      )}
                      {masteryPct >= 75 && (
                        <span title="On track">
                          <CheckCircle2
                            className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 text-color-signal-green"
                            strokeWidth={2}
                          />
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-foreground">
                    {subjectName}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    {tier !== "free" && masteryPct !== null
                      ? `${masteryPct}% mastery`
                      : `${qCount} questions`}
                  </p>
                  {studiers >= SOCIAL_PROOF_MIN && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {studiers} people studied {subjectName} today
                    </p>
                  )}
                </div>
              </div>

              {/* Single CTA */}
              <Link
                href={`/dashboard/quiz?subject=${subject.id}&quick=true`}
                className="block mt-3"
              >
                <Button
                  size="sm"
                  className="w-full text-xs h-9"
                >
                  <Play className="mr-1 h-3 w-3" strokeWidth={1.5} />
                  Quick Start
                </Button>
              </Link>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
