"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import type { Subject } from "@/types/app";

interface LibraryTabProps {
  subjects: Subject[];
  questionCounts: Record<string, number>;
}

export function LibraryTab({ subjects, questionCounts }: LibraryTabProps) {
  if (subjects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No subjects for your exam yet. Check back later.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Browse questions by subject and question bank.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => {
          const color = subject.color ?? "#86868B";
          const qCount = questionCounts[subject.id] ?? 0;
          return (
            <Link key={subject.id} href={`/dashboard/library/subject/${subject.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <BookOpen className="h-6 w-6" style={{ color }} strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">
                      {subject.short_name ?? subject.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {qCount} question{qCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
