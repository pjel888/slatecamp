'use client';

import { PendingButton } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowRight, Zap, Target, Compass, RotateCcw } from 'lucide-react';
import { startDailyMission } from '@/lib/actions/daily-mission';
import { ROUTES } from '@/lib/constants/routes';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { DailyMissionData } from '@/types/app';

interface DailyMissionProps {
  mission: DailyMissionData;
  examProfileId: string;
}

const MISSION_ICONS = {
  srs_review: RotateCcw,
  weak_area_drill: Target,
  exploration: Compass,
  quick_session: Zap,
} as const;

const MISSION_BADGE_LABELS = {
  srs_review: 'SRS Review',
  weak_area_drill: 'Weak Area',
  exploration: 'Explore',
  quick_session: 'Quick Session',
} as const;

export function DailyMission({ mission, examProfileId }: DailyMissionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const Icon = MISSION_ICONS[mission.type];

  const handleStartMission = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await startDailyMission(examProfileId, mission.sessionConfig);
        router.push(ROUTES.QUIZ_SESSION(result.sessionId));
      } catch {
        setError('Failed to start mission. Please try again.');
      }
    });
  };

  if (mission.completedToday) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 border-l-4 border-l-[var(--color-signal-green)]">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-[var(--color-signal-green)] shrink-0" strokeWidth={1.5} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Today&apos;s Mission
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              Mission complete! You answered {mission.questionCount} questions.
            </p>
            <PendingButton
              variant="outline"
              size="sm"
              className="mt-3 text-xs"
              onClick={handleStartMission}
              pending={isPending}
              pendingLabel="Loading..."
            >
              Keep going <ArrowRight className="ml-1 h-3 w-3" />
            </PendingButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 border-l-4 border-l-[var(--color-signal-amber)]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Today&apos;s Mission
          </p>
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Icon className="h-3 w-3" strokeWidth={1.5} />
            {MISSION_BADGE_LABELS[mission.type]}
          </Badge>
        </div>

        <h3 className="text-base font-semibold text-foreground leading-snug sm:text-lg">
          {mission.label}
        </h3>

        <p className="text-xs text-muted-foreground">
          {mission.questionCount} questions &middot; ~{mission.estimatedMinutes} min
        </p>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        <PendingButton
          className="w-full h-11 text-sm font-semibold"
          onClick={handleStartMission}
          pending={isPending}
          pendingLabel="Starting..."
        >
          Start Mission <ArrowRight className="ml-1.5 h-4 w-4" />
        </PendingButton>
      </div>
    </div>
  );
}
