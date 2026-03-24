'use client'

import type { CalibrationResult, CalibrationSubject } from '@/types/testing'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalibrationRevealProps {
  calibration: CalibrationResult
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GAP_COLORS: Record<CalibrationSubject['gapDirection'], string> = {
  overconfident: 'var(--warning)',
  underconfident: 'var(--success)',
  calibrated: 'var(--primary)',
}

const CONFIDENCE_LABELS: Record<number, string> = {
  1: 'No idea',
  2: 'Shaky',
  3: 'Okay',
  4: 'Good',
  5: 'Solid',
}

// ─── Confidence Block Indicators (5 small squares) ────────────────────────────

const ConfidenceBlocks = ({ level }: { level: number }) => (
  <span className="inline-flex gap-0.5 ml-1" aria-hidden="true">
    {[1, 2, 3, 4, 5].map(i => (
      <span
        key={i}
        className="inline-block rounded-sm"
        style={{
          width: 6,
          height: 6,
          backgroundColor: i <= level ? 'var(--primary)' : 'var(--border-default)',
        }}
      />
    ))}
  </span>
)

// ─── Subject Row ──────────────────────────────────────────────────────────────

const SubjectRow = ({ subject, isLast }: { subject: CalibrationSubject; isLast: boolean }) => {
  const gapColor = GAP_COLORS[subject.gapDirection]

  return (
    <div className={`py-3${isLast ? '' : ' border-b border-border'}`}>
      {/* Subject name */}
      <p
        className="text-sm font-medium"
        style={{ color: 'var(--foreground)' }}
      >
        {subject.subjectName}
      </p>

      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
        {/* Prediction */}
        <p
          className="text-[13px]"
          style={{ color: 'var(--text-secondary)' }}
        >
          You predicted:{' '}
          <span className="font-medium">
            {CONFIDENCE_LABELS[subject.predictedLevel] ?? `Level ${subject.predictedLevel}`} ({subject.predictedLevel}/5)
          </span>
          <ConfidenceBlocks level={subject.predictedLevel} />
        </p>

        {/* Actual */}
        <p
          className="text-[13px]"
          style={{ color: 'var(--text-secondary)' }}
        >
          You scored:{' '}
          <span
            className="font-medium"
            style={{ color: gapColor }}
          >
            {subject.actualAccuracy}%
          </span>
        </p>
      </div>

      {/* Gap text */}
      <p
        className="mt-1 text-[13px]"
        style={{ color: gapColor }}
      >
        {subject.gapText}
      </p>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CalibrationReveal = ({ calibration }: CalibrationRevealProps) => (
  <div>
    {/* Section label */}
    <p
      className="mb-3 text-[11px] font-medium uppercase tracking-widest"
      style={{ color: 'var(--muted-foreground)' }}
    >
      Your Calibration
    </p>

    <div className="bg-card rounded-lg border border-border p-5">
      {/* Subject rows */}
      {calibration.subjects.map((subject, idx) => (
        <SubjectRow
          key={subject.subjectName}
          subject={subject}
          isLast={idx === calibration.subjects.length - 1}
        />
      ))}

      {/* Overall score */}
      <div className="mt-4 pt-3 border-t border-border">
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--foreground)' }}
        >
          Calibration score:{' '}
          <span style={{ color: 'var(--primary)' }}>
            {calibration.overallScore} / 100
          </span>
        </p>
        <p
          className="mt-0.5 text-xs"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Higher = better self-knowledge
        </p>
      </div>
    </div>
  </div>
)
