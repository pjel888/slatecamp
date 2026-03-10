"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Loader2 } from "lucide-react";
import { siteConfig } from "@/lib/constants/site";
import { ShareCard } from "@/components/quiz/ShareCard";
import type { SubjectScore } from "@/types/app";

interface ShareSectionProps {
  scorePct: number;
  sessionLabel: string;
  subjectScores: SubjectScore[];
  insight: string;
  readinessScore: number | null;
  examProfileName: string;
}

export function ShareSection({
  scorePct,
  sessionLabel,
  subjectScores,
  insight,
  readinessScore,
  examProfileName,
}: ShareSectionProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 1,
        useCORS: true,
        backgroundColor: "#F5F3F0",
        width: 1080,
        height: 1920,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setSharing(false);
          return;
        }
        const file = new File(
          [blob],
          `${siteConfig.name.toLowerCase()}-result-${new Date().toISOString().slice(0, 10)}.png`,
          { type: "image/png" }
        );
        if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `My ${siteConfig.name} session result`,
          });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name;
          a.click();
          URL.revokeObjectURL(url);
        }
        setSharing(false);
      }, "image/png");
    } catch {
      setSharing(false);
    }
  }

  const subjectRows = subjectScores.map((ss) => ({
    subject_name: ss.subject_name,
    percentage: ss.percentage,
  }));

  return (
    <div className="space-y-4">
      {/* Hidden card for capture — fixed size, off-screen */}
      <div
        className="fixed left-[-9999px] top-0"
        style={{ width: 1080, height: 1920 }}
        aria-hidden
      >
        <div ref={cardRef}>
          <ShareCard
            scorePct={scorePct}
            sessionLabel={sessionLabel}
            subjectScores={subjectRows}
            insight={insight}
            readinessScore={readinessScore}
            examProfileName={examProfileName}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">Share your result</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Download as image or share to social (e.g. ALE groups).
        </p>
        <Button
          onClick={handleShare}
          disabled={sharing}
          className="mt-3 gap-2"
          size="sm"
        >
          {sharing ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
          ) : (
            <Share2 className="h-4 w-4" strokeWidth={1.5} />
          )}
          Share as Image
        </Button>
      </div>
    </div>
  );
}
