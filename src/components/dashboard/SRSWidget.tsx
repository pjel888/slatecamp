"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle2 } from "lucide-react";
import type { SRSDashboardData } from "@/lib/actions/srs-dashboard";

interface SRSWidgetProps {
  data: SRSDashboardData;
}

function formatNextReview(nextReviewAt: string | null): string {
  if (!nextReviewAt) return "—";
  const at = new Date(nextReviewAt);
  const now = Date.now();
  const diffMs = at.getTime() - now;
  const hours = Math.round(diffMs / (60 * 60 * 1000));
  if (hours < 1) return "in < 1 hour";
  if (hours < 24) return `in ${hours} hour${hours !== 1 ? "s" : ""}`;
  const days = Math.round(hours / 24);
  return `in ${days} day${days !== 1 ? "s" : ""}`;
}

export function SRSWidget({ data }: SRSWidgetProps) {
  const { dueCount, avgRetentionPercent, nextReviewAt, nextReviewCount } = data;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Zap className="h-4 w-4" strokeWidth={1.5} />
          SRS Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        {dueCount > 0 ? (
          <>
            <p className="text-2xl font-semibold font-mono text-foreground">
              {dueCount} items need review today
            </p>
            {avgRetentionPercent != null && (
              <p className="mt-1 text-xs text-muted-foreground">
                Avg. retention: {avgRetentionPercent}% → dropping fast
              </p>
            )}
            <Link href="/dashboard/quiz?type=srs_review">
              <Button size="sm" className="mt-3 w-full text-xs">
                Start SRS Review
              </Button>
            </Link>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-color-signal-green">
              <CheckCircle2 className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-sm font-medium">You&apos;re caught up on SRS</span>
            </div>
            {nextReviewCount > 0 && nextReviewAt && (
              <p className="mt-2 text-xs text-muted-foreground">
                Next review: {formatNextReview(nextReviewAt)} ({nextReviewCount} items)
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
