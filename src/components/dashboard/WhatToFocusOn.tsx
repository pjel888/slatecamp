"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Play } from "lucide-react";

interface WeakSubject {
  subject_id: string;
  subject_name: string;
  percentage: number;
  suggestedCount?: number;
}

interface WhatToFocusOnProps {
  weakSubjects: WeakSubject[];
  examProfileId: string;
}

export function WhatToFocusOn({
  weakSubjects,
  examProfileId,
}: WhatToFocusOnProps) {
  if (weakSubjects.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          What to focus on
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {weakSubjects.slice(0, 3).map((s) => (
          <div
            key={s.subject_id}
            className="flex items-center justify-between rounded-lg border border-border p-3"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{s.subject_name}</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(s.percentage)}% accuracy
                {s.suggestedCount != null ? ` · ${s.suggestedCount} questions suggested` : ""}
              </p>
            </div>
            <Link href={`/dashboard/quiz?subject=${s.subject_id}&quick=true`}>
              <Button size="sm" variant="outline" className="gap-1 text-xs">
                <Play className="h-3 w-3" strokeWidth={1.5} />
                Drill
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
