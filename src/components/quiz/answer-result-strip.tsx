"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Check, X, ExternalLink, Lightbulb, Box, BookOpen } from "lucide-react";
import type { QuestionReference } from "@/types/app";

export interface AnswerResultStripQuestion {
  explanation?: string | null;
  explanation_image_url?: string | null;
  references?: QuestionReference[] | null;
  fun_facts?: string[] | null;
  mnemonics?: string | null;
  has_3d_component?: boolean;
}

const SOCIAL_PROOF_MIN = 5;
/** Single-line preview length so the strip keeps a fixed height. */
const EXPLANATION_PREVIEW_LENGTH = 90;

interface AnswerResultStripProps {
  isAnswered: boolean;
  correct: boolean;
  correctChoiceText: string;
  question: AnswerResultStripQuestion;
  showSeeMore?: boolean;
  threeDLabel?: string;
  /** Shown after answering when weeklyAttempts >= SOCIAL_PROOF_MIN */
  socialProof?: { weeklyAttempts: number; weeklyAccuracy: number } | null;
  /** F-06: "Tricky one!" when user tapped "I know this" but was wrong */
  showTrickyOne?: boolean;
}

export function AnswerResultStrip({
  isAnswered,
  correct,
  correctChoiceText,
  question,
  showSeeMore = true,
  socialProof,
  showTrickyOne,
}: AnswerResultStripProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [readMoreOpen, setReadMoreOpen] = useState(false);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (!isAnswered) {
      setShowExplanation(false);
      setReadMoreOpen(false);
      return;
    }
    if (prefersReducedMotion.current) {
      setShowExplanation(true);
      return;
    }
    const timer = setTimeout(() => setShowExplanation(true), 400);
    return () => clearTimeout(timer);
  }, [isAnswered]);

  if (!isAnswered) {
    return (
      <div className="mt-4 h-[88px] shrink-0 rounded-lg border border-border/40 bg-muted/10" aria-hidden="true">
        <span className="sr-only">Result will appear after you answer</span>
      </div>
    );
  }

  const explanation = question.explanation ?? "";
  const explanationPreview =
    explanation.length > EXPLANATION_PREVIEW_LENGTH
      ? explanation.slice(0, EXPLANATION_PREVIEW_LENGTH).trim() + "..."
      : explanation;

  const hasReferences = (question.references?.length ?? 0) > 0;
  const hasFunFacts = (question.fun_facts?.length ?? 0) > 0;
  const hasMnemonics = !!question.mnemonics;
  const has3D = !!question.has_3d_component;
  const hasExplanationImage = !!question.explanation_image_url;
  const hasReadMoreContent =
    showSeeMore &&
    (explanation || hasReferences || hasFunFacts || hasMnemonics || has3D || hasExplanationImage);

  return (
    <>
      {/* Fixed-height strip: one line result + one line explanation + Read more */}
      <div className="mt-4 flex h-[88px] flex-col justify-center gap-0.5 rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          {correct ? (
            <Check className="h-5 w-5 shrink-0 text-(--color-signal-green)" strokeWidth={2} />
          ) : (
            <X className="h-5 w-5 shrink-0 text-(--color-signal-red)" strokeWidth={2} />
          )}
          <span className="truncate text-sm font-medium text-foreground">
            {showTrickyOne ? "Tricky one!" : correct ? "Correct!" : `Incorrect. Answer: ${correctChoiceText}`}
          </span>
        </div>

        {/* Single line of explanation only; rest is in Read more popup */}
        {showExplanation && explanation && (
          <p className="min-h-5 truncate text-[13px] text-muted-foreground" title={explanation}>
            {explanationPreview}
          </p>
        )}
        {showExplanation && !explanation && socialProof && socialProof.weeklyAttempts >= SOCIAL_PROOF_MIN && (
          <p className="min-h-5 truncate text-xs text-muted-foreground">
            {socialProof.weeklyAttempts} ALE reviewees answered this question this week.{" "}
            {Math.round(socialProof.weeklyAccuracy * 100)}% got it right.
          </p>
        )}
        {showExplanation && !explanation && socialProof && socialProof.weeklyAttempts > 0 && socialProof.weeklyAttempts < SOCIAL_PROOF_MIN && (
          <p className="min-h-5 truncate text-xs text-muted-foreground">Be one of the first to answer this.</p>
        )}

        {showExplanation && hasReadMoreContent && (
          <button
            type="button"
            onClick={() => setReadMoreOpen(true)}
            className="shrink-0 self-start text-xs font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
          >
            Read more
          </button>
        )}
      </div>

      {/* Read more popup — blurred/frosted overlay (Dialog uses backdrop-blur-md) */}
      <Dialog open={readMoreOpen} onOpenChange={setReadMoreOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[520px]">
          <DialogTitle>Explanation</DialogTitle>
          <DialogDescription className="sr-only">
            Full explanation, references, and related content for this question.
          </DialogDescription>
          <div className="space-y-4 pt-1">
              {question.explanation_image_url && (
                <div className="relative h-48 w-full overflow-hidden rounded-xl bg-muted/30">
                  <Image
                    src={question.explanation_image_url}
                    alt="Explanation"
                    fill
                    className="object-contain"
                    sizes="520px"
                  />
                </div>
              )}
              {explanation && (
                <p className="text-[15px] leading-relaxed text-muted-foreground">{explanation}</p>
              )}

              {hasReferences && question.references && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <BookOpen className="mr-1 inline h-3.5 w-3.5" strokeWidth={1.5} />
                    References
                  </p>
                  <div className="rounded-lg border border-border p-3 space-y-1.5">
                    {question.references.map((ref, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ExternalLink className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                        <span>
                          {ref.title}
                          {ref.page ? ` — p. ${ref.page}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hasFunFacts && question.fun_facts && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Lightbulb className="mr-1 inline h-3.5 w-3.5" strokeWidth={1.5} />
                    Fun fact
                  </p>
                  <div className="rounded-lg border border-border p-3 space-y-2">
                    {question.fun_facts.map((fact, i) => (
                      <div key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                        <span>{fact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hasMnemonics && question.mnemonics && (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Mnemonic</p>
                  <p className="mt-1 text-sm text-foreground">{question.mnemonics}</p>
                </div>
              )}

              {has3D && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Box className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  <span>3D model available for this topic.</span>
                </div>
              )}
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
