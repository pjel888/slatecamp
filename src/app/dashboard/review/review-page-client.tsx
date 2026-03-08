"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Play, Shuffle, ClipboardList } from "lucide-react";
import { ReviewFeed } from "./review-feed";
import type { Subject, SubjectMastery } from "@/types/app";

const DISCLAIMER_KEY = "cerebro_review_disclaimer_dismissed";

interface ReviewPageClientProps {
  examProfileId: string;
  subjects: Subject[];
  masteries: SubjectMastery[];
  questionCounts: Record<string, number>;
}

type View = "grid" | "disclaimer" | "intro" | "feed";

export function ReviewPageClient({
  examProfileId,
  subjects,
  masteries,
  questionCounts,
}: ReviewPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [skipDisclaimer, setSkipDisclaimer] = useState(false);
  const [view, setView] = useState<View>("grid");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    try {
      setSkipDisclaimer(localStorage.getItem(DISCLAIMER_KEY) === "true");
    } catch {
      // ignore
    }
  }, []);

  // When header/sidebar "Exit" sends ?exited=1, return to subject grid and clear URL
  useEffect(() => {
    if (searchParams.get("exited") === "1") {
      setView("grid");
      setSelectedSubjectId(null);
      router.replace("/dashboard/review", { scroll: true });
    }
  }, [searchParams, router]);

  function startReview(subjectId: string | null) {
    setSelectedSubjectId(subjectId);
    if (skipDisclaimer) {
      setView("intro");
    } else {
      setView("disclaimer");
    }
  }

  function onDisclaimerContinue() {
    if (dontShowAgain) {
      try {
        localStorage.setItem(DISCLAIMER_KEY, "true");
      } catch {
        // ignore
      }
    }
    setView("intro");
  }

  function onStartTest() {
    setView("feed");
  }

  const selectedSubject = selectedSubjectId
    ? subjects.find((s) => s.id === selectedSubjectId)
    : null;
  const subjectLabel = selectedSubject
    ? selectedSubject.short_name ?? selectedSubject.name
    : "All subjects";
  const questionCount = selectedSubjectId
    ? questionCounts[selectedSubjectId] ?? 0
    : Object.values(questionCounts).reduce((a, b) => a + b, 0);

  if (view === "feed") {
    return (
      <ReviewFeed
        examProfileId={examProfileId}
        subjects={subjects}
        initialSubjectId={selectedSubjectId ?? undefined}
        initialQuestions={[]}
      />
    );
  }

  if (view === "disclaimer") {
    return (
      <div className="mx-auto max-w-[480px] rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground">
          <BookOpen className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <h2 className="mt-6 text-lg font-semibold text-foreground">Casual review mode</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This is just for you to revise. No data is being stored—your answers and progress in this
          mode are not saved. Use it to freely practice without affecting your stats.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Don’t show again
          </label>
        </div>
        <Button className="mt-6 w-full" onClick={onDisclaimerContinue}>
          Continue
        </Button>
      </div>
    );
  }

  if (view === "intro") {
    return (
      <div className="mx-auto flex max-w-[520px] flex-col items-center rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-amber/10 text-amber">
          <ClipboardList className="h-12 w-12" strokeWidth={1.5} />
        </div>
        <h1 className="mt-6 text-xl font-semibold text-foreground">Good luck in your review!</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          You’re about to start casual review. Here’s a quick recap.
        </p>
        <div className="mt-6 w-full space-y-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mode</span>
            <span className="font-medium text-foreground">Review (no data stored)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Scope</span>
            <span className="font-medium text-foreground">{subjectLabel}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Questions</span>
            <span className="font-medium text-foreground">{questionCount > 0 ? questionCount : "—"}</span>
          </div>
        </div>
        <Button size="lg" className="mt-8 h-12 gap-2 px-8 text-base" onClick={onStartTest}>
          <Play className="h-5 w-5" strokeWidth={1.5} />
          Start review
        </Button>
      </div>
    );
  }

  // Grid view
  const totalQuestions = Object.values(questionCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Review</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a subject to freely review, or practice with random questions from all subjects.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => {
          const mastery = masteries.find((m) => m.subject_id === subject.id);
          const qCount = questionCounts[subject.id] ?? 0;
          const masteryPct = mastery ? Math.round(mastery.mastery_score) : null;
          const color = subject.color ?? "#86868B";

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
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <BookOpen className="h-5 w-5" style={{ color }} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {subject.short_name ?? subject.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{qCount} questions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold font-mono text-foreground">
                      {masteryPct ?? 0}%
                    </span>
                    <p className="text-[10px] text-muted-foreground">mastery</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground" aria-hidden="true">
                      0%
                    </span>
                    <div className="h-1.5 flex-1 rounded-full bg-secondary" role="progressbar" aria-valuenow={mastery?.mastery_score ?? 0} aria-valuemin={0} aria-valuemax={100} aria-label={`Mastery ${masteryPct ?? 0}%`}>
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min(mastery?.mastery_score ?? 0, 100)}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground" aria-hidden="true">
                      100%
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => startReview(subject.id)}
                  >
                    <BookOpen className="mr-1.5 h-3 w-3" strokeWidth={1.5} />
                    Review
                  </Button>
                  <Link href={`/dashboard/quiz?subject=${subject.id}&quick=true`} className="flex-1">
                    <Button size="sm" className="w-full text-xs">
                      <Play className="mr-1.5 h-3 w-3" strokeWidth={1.5} />
                      Quick Start
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Random from all subjects */}
        <Card className="group relative overflow-hidden border-dashed transition-shadow hover:shadow-md">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <Shuffle className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Random</h3>
                  <p className="text-xs text-muted-foreground">
                    {totalQuestions} questions from all subjects
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => startReview(null)}
              >
                <BookOpen className="mr-1.5 h-3 w-3" strokeWidth={1.5} />
                Review
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
