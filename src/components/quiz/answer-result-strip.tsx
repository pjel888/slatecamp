"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface AnswerResultStripProps {
  isAnswered: boolean;
  correct: boolean;
  correctChoiceText: string;
  question: AnswerResultStripQuestion;
  /** When false, "See more" is never shown (e.g. quiz before feedback is allowed). Default true. */
  showSeeMore?: boolean;
  /** Label for 3D button in dialog. Default "View 3D Model". */
  threeDLabel?: string;
}

function hasSeeMoreContent(q: AnswerResultStripQuestion): boolean {
  return !!(
    q.explanation ||
    q.explanation_image_url ||
    (q.references?.length ?? 0) > 0 ||
    (q.fun_facts?.length ?? 0) > 0 ||
    q.mnemonics ||
    q.has_3d_component
  );
}

export function AnswerResultStrip({
  isAnswered,
  correct,
  correctChoiceText,
  question,
  showSeeMore = true,
  threeDLabel = "View 3D Model",
}: AnswerResultStripProps) {
  const showButton = isAnswered && showSeeMore && hasSeeMoreContent(question);

  return (
    <div className="mt-4 flex h-16 shrink-0 items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-4">
      {!isAnswered ? (
        /* Empty space; same height so layout doesn't shift when result appears */
        <span className="sr-only">Result will appear after you check your answer</span>
      ) : (
        <>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {correct ? (
              <Check className="h-5 w-5 shrink-0 text-success" strokeWidth={2} />
            ) : (
              <X className="h-5 w-5 shrink-0 text-danger" strokeWidth={2} />
            )}
            <span className="truncate text-sm font-medium text-foreground">
              {correct ? "Correct." : "Incorrect."} Correct: {correctChoiceText}
            </span>
          </div>
          {showButton && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 text-xs">
                  <BookOpen className="h-3.5 w-3.5" strokeWidth={1.5} />
                  See more
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] max-w-[min(480px,calc(100vw-2rem))] overflow-y-auto sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{correct ? "Correct" : "Incorrect"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-muted-foreground">Correct: {correctChoiceText}</p>
                  {question.explanation && (
                    <div className="rounded-lg bg-secondary/50 p-4">
                      <p className="text-sm leading-relaxed text-foreground">{question.explanation}</p>
                    </div>
                  )}
                  {question.explanation_image_url && (
                    <div className="flex items-center justify-center overflow-hidden rounded-lg bg-muted/20">
                      <img
                        src={question.explanation_image_url}
                        alt="Explanation"
                        className="max-h-48 w-full object-contain"
                      />
                    </div>
                  )}
                  {(question.references?.length ?? 0) > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">References</p>
                      <div className="space-y-1.5">
                        {question.references!.map((ref, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ExternalLink className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                            <span>{ref.title}{ref.page != null && ref.page !== "" ? ` — p. ${ref.page}` : ""}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {(question.fun_facts?.length ?? 0) > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Fun Facts</p>
                      <div className="space-y-2">
                        {question.fun_facts!.map((fact, i) => (
                          <div key={i} className="flex gap-2 text-sm text-muted-foreground">
                            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                            <span>{fact}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {question.mnemonics && (
                    <div className="rounded-lg border border-warning/20 bg-warning/5 p-3">
                      <p className="text-xs font-medium text-warning">Mnemonic</p>
                      <p className="mt-1 text-sm text-foreground">{question.mnemonics}</p>
                    </div>
                  )}
                  {question.has_3d_component && (
                    <Button variant="outline" size="sm" className="gap-2">
                      <Box className="h-4 w-4" strokeWidth={1.5} />
                      {threeDLabel}
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  );
}
