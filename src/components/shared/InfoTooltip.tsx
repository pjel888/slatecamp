"use client";

import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface InfoTooltipProps {
  /** Tooltip content (plain text or JSX). */
  content: React.ReactNode;
  /** Optional side. Default top. */
  side?: "top" | "right" | "bottom" | "left";
  /** Optional class for the icon button. */
  className?: string;
}

/**
 * Question mark icon that shows an interactive tooltip on hover.
 * Use next to card titles and labels (e.g. Exam Countdown, Current Streak).
 */
export function InfoTooltip({ content, side = "top", className }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label="More info"
            className={
              className ??
              "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            }
          >
            <HelpCircle className="h-4 w-4" strokeWidth={1.5} />
          </button>
        }
      />
      <TooltipContent side={side} sideOffset={6} className="max-w-[260px]">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
