'use client';

import { useEffect, useRef, useState } from 'react';

interface ReadinessGaugeProps {
  score: number;
  previousScore?: number | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animateOnMount?: boolean;
}

const SIZE_MAP = {
  sm: 140,
  md: 180,
  lg: 200,
} as const;

const FONT_SIZE_MAP = {
  sm: 28,
  md: 36,
  lg: 48,
} as const;

function getScoreColor(score: number): string {
  if (score >= 90) return '#22C55E';
  if (score >= 75) return '#22C55E';
  if (score >= 60) return '#84CC16';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Exam Ready';
  if (score >= 75) return 'Strong';
  if (score >= 60) return 'Getting There';
  if (score >= 40) return 'Building Momentum';
  return 'Needs Work';
}

export function ReadinessGauge({
  score,
  previousScore,
  size = 'lg',
  showLabel = true,
  animateOnMount = true,
}: ReadinessGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(animateOnMount ? 0 : score);
  const animationRef = useRef<number | null>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!animateOnMount || prefersReducedMotion.current) {
      setAnimatedScore(score);
      return;
    }

    const startTime = performance.now();
    const duration = 1200;
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (score - startValue) * eased;
      setAnimatedScore(Math.round(current));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [score, animateOnMount]);

  const diameter = SIZE_MAP[size];
  const strokeWidth = 12;
  const radius = (diameter - strokeWidth) / 2;
  const center = diameter / 2;

  // 270° arc with 45° gap at bottom
  const startAngle = 135; // degrees
  const endAngle = 405; // 135 + 270
  const arcLength = 270;

  const scoreAngle = startAngle + (arcLength * animatedScore) / 100;

  const toRadians = (deg: number) => (deg * Math.PI) / 180;

  const arcStartX = center + radius * Math.cos(toRadians(startAngle));
  const arcStartY = center + radius * Math.sin(toRadians(startAngle));

  const arcEndX = center + radius * Math.cos(toRadians(endAngle));
  const arcEndY = center + radius * Math.sin(toRadians(endAngle));

  const scoreEndX = center + radius * Math.cos(toRadians(scoreAngle));
  const scoreEndY = center + radius * Math.sin(toRadians(scoreAngle));

  const largeArcBg = 1; // 270° > 180°
  const largeArcScore = animatedScore > (100 * 180) / 270 ? 1 : 0;

  const bgPath = `M ${arcStartX} ${arcStartY} A ${radius} ${radius} 0 ${largeArcBg} 1 ${arcEndX} ${arcEndY}`;
  const scorePath = animatedScore > 0
    ? `M ${arcStartX} ${arcStartY} A ${radius} ${radius} 0 ${largeArcScore} 1 ${scoreEndX} ${scoreEndY}`
    : '';

  const color = getScoreColor(animatedScore);
  const label = getScoreLabel(score);
  const fontSize = FONT_SIZE_MAP[size];

  const delta = previousScore != null ? score - previousScore : null;
  const showDelta = delta != null && Math.abs(delta) >= 1;

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: diameter, height: diameter }}>
      <svg
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
        className="transform -rotate-0"
      >
        {/* Glow filter */}
        <defs>
          <filter id={`glow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor={color} floodOpacity="0.3" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <path
          d={bgPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-border"
          opacity={0.3}
        />

        {/* Score arc */}
        {scorePath && (
          <path
            d={scorePath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter={`url(#glow-${size})`}
          />
        )}

        {/* Center score text */}
        <text
          x={center}
          y={center - (showLabel ? 4 : 0)}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-foreground"
          style={{
            fontSize: `${fontSize}px`,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            fontFamily: 'var(--font-mono), ui-monospace, monospace',
          }}
        >
          {animatedScore}
        </text>

        {/* Label text */}
        {showLabel && (
          <text
            x={center}
            y={center + fontSize / 2 + 8}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-muted-foreground"
            style={{ fontSize: size === 'sm' ? '10px' : '12px', fontWeight: 500 }}
          >
            {label}
          </text>
        )}
      </svg>

      {/* Delta badge */}
      {showDelta && delta != null && (
        <div
          className="absolute top-1 right-1 rounded-full px-1.5 py-0.5 text-xs font-semibold"
          style={{
            backgroundColor: delta > 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: delta > 0 ? '#22C55E' : '#EF4444',
            fontSize: size === 'sm' ? '9px' : '11px',
          }}
        >
          {delta > 0 ? `↑ +${delta}` : `↓ ${delta}`}
        </div>
      )}
    </div>
  );
}
