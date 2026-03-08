"use client";

/**
 * Mini SVG sparkline: retention declining from last review to now.
 * R(t) = e^(-t / S). Width ~60px, height ~20px.
 */
interface ForgettingCurveSparklineProps {
  intervalDays: number;
  daysSinceReview: number;
  className?: string;
}

export function ForgettingCurveSparkline({
  intervalDays,
  daysSinceReview,
  className = "",
}: ForgettingCurveSparklineProps) {
  const width = 60;
  const height = 20;
  const points: number[] = [];
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * daysSinceReview;
    const S = Math.max(0.1, intervalDays);
    const R = Math.exp(-t / S);
    points.push(R);
  }
  const maxR = Math.max(...points, 0.01);
  const pathD = points
    .map((r, i) => {
      const x = (i / steps) * width;
      const y = height - (r / maxR) * height;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      className={className}
      aria-hidden
    >
      <path
        d={pathD}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground"
      />
      <circle
        cx={width}
        cy={height - (points[points.length - 1]! / maxR) * height}
        r="2"
        fill="currentColor"
        className="text-foreground"
      />
    </svg>
  );
}
