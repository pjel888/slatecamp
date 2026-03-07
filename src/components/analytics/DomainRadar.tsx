"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { name: string; value: number }[];
}

export function DomainRadar({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Answer questions across domains to see your mastery radar.
      </p>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          />
          <Radar
            name="Mastery"
            dataKey="value"
            stroke="var(--color-signal-amber)"
            fill="var(--color-signal-amber)"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
