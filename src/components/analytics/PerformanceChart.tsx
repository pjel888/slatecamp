"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TestSession } from "@/types/app";

interface Props {
  sessions: TestSession[];
}

export function PerformanceChart({ sessions }: Props) {
  const data = sessions.map((s) => ({
    date: new Date(s.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    score: s.score_percentage != null ? Math.round(s.score_percentage) : 0,
  }));

  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Complete a quiz to see your performance chart.
      </p>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            stroke="var(--border)"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            stroke="var(--border)"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--color-signal-amber)"
            strokeWidth={2}
            dot={{ fill: "var(--color-signal-amber)", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
