"use client";

import type { DailyUserStats } from "@/types/app";

interface Props {
  stats: DailyUserStats[];
}

export function StreakCalendar({ stats }: Props) {
  // Build a map of date → questions_attempted for the last 12 weeks
  const statsMap = new Map<string, number>();
  stats.forEach((s) => statsMap.set(s.date, s.questions_attempted));

  const weeks: { date: string; count: number }[][] = [];
  const today = new Date();

  for (let w = 11; w >= 0; w--) {
    const week: { date: string; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (w * 7 + (6 - d)));
      const dateStr = date.toISOString().split("T")[0];
      week.push({ date: dateStr, count: statsMap.get(dateStr) ?? 0 });
    }
    weeks.push(week);
  }

  const maxCount = Math.max(1, ...stats.map((s) => s.questions_attempted));

  function getIntensity(count: number): string {
    if (count === 0) return "bg-secondary";
    const ratio = count / maxCount;
    if (ratio < 0.25) return "bg-[var(--color-signal-green)]/20";
    if (ratio < 0.5) return "bg-[var(--color-signal-green)]/40";
    if (ratio < 0.75) return "bg-[var(--color-signal-green)]/60";
    return "bg-[var(--color-signal-green)]";
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                className={`h-3 w-3 rounded-sm ${getIntensity(day.count)}`}
                title={`${day.date}: ${day.count} questions`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-sm bg-secondary" />
          <div className="h-3 w-3 rounded-sm bg-[var(--color-signal-green)]/20" />
          <div className="h-3 w-3 rounded-sm bg-[var(--color-signal-green)]/40" />
          <div className="h-3 w-3 rounded-sm bg-[var(--color-signal-green)]/60" />
          <div className="h-3 w-3 rounded-sm bg-[var(--color-signal-green)]" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
