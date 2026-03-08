"use client";

/**
 * ShareCard — Rendered off-screen at 1080×1920 portrait for html2canvas capture.
 * Light theme, amber accent. Used for "Share as Image" on session summary.
 */
export interface ShareCardProps {
  scorePct: number;
  sessionLabel: string;
  subjectScores: { subject_name: string; percentage: number }[];
  insight: string;
  readinessScore?: number | null;
  examProfileName?: string;
  domain?: string;
}

export function ShareCard({
  scorePct,
  sessionLabel,
  subjectScores,
  insight,
  readinessScore,
  examProfileName = "ALE",
  domain = "cerebroapp.ph",
}: ShareCardProps) {
  return (
    <div
      className="flex flex-col bg-[#F5F3F0] text-[#372E3D]"
      style={{
        width: 1080,
        height: 1920,
        padding: 48,
        fontFamily: "system-ui, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Top row: wordmark + exam name */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-xl font-semibold" style={{ color: "#372E3D" }}>
          Cerebro
        </span>
        <span className="text-lg text-[#6B7280]">{examProfileName}</span>
      </div>

      {/* Large score */}
      <div className="flex flex-col items-center justify-center flex-1 py-8">
        <span
          className="font-bold tabular-nums"
          style={{ fontSize: 120, lineHeight: 1, color: "#372E3D" }}
        >
          {Math.round(scorePct)}%
        </span>
        <p className="mt-4 text-2xl text-[#6B7280] max-w-[90%] text-center">
          {sessionLabel}
        </p>

        {/* Subject breakdown — 3–5 rows */}
        {subjectScores.length > 0 && (
          <div className="mt-8 w-full max-w-[700px] space-y-3">
            {subjectScores.slice(0, 5).map((ss) => (
              <div key={ss.subject_name} className="flex items-center gap-4">
                <span
                  className="shrink-0 text-lg w-32 truncate"
                  style={{ color: "#372E3D" }}
                >
                  {ss.subject_name}
                </span>
                <div
                  className="flex-1 h-6 rounded-full bg-white border border-[#E8E4DF] overflow-hidden"
                  style={{ maxWidth: 400 }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(0, ss.percentage))}%`,
                      backgroundColor: "#ED8008",
                    }}
                  />
                </div>
                <span className="text-lg font-mono font-medium w-12 text-right">
                  {Math.round(ss.percentage)}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Insight */}
        <p className="mt-6 text-xl text-center max-w-[800px]" style={{ color: "#4B5563" }}>
          {insight}
        </p>
      </div>

      {/* Bottom bar: domain + readiness */}
      <div
        className="flex justify-between items-center pt-4 border-t border-[#E8E4DF]"
        style={{ borderTopWidth: 1 }}
      >
        <span className="text-lg text-[#6B7280]">{domain}</span>
        {readinessScore != null && (
          <span
            className="px-3 py-1 rounded-lg text-base font-medium"
            style={{ backgroundColor: "#ED8008", color: "#FFF" }}
          >
            Readiness {readinessScore}%
          </span>
        )}
      </div>
    </div>
  );
}
