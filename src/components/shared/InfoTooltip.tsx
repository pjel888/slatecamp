"use client";

import { StandardInfoPopover } from "./StandardInfoPopover";

interface InfoTooltipProps {
  /** Tooltip content (plain text or JSX). Uses same card UI as SRS/Quiz mode info. */
  content: React.ReactNode;
  /** Optional title. */
  title?: string;
  /** Optional side. Default top. */
  side?: "top" | "right" | "bottom" | "left";
  /** Optional align. */
  align?: "start" | "center" | "end";
  /** Optional class for the trigger icon. */
  className?: string;
}

/**
 * Question mark icon that opens the standard info popover (SRS-style card).
 * Use next to card titles and labels for consistent UX across dashboard, analytics, quiz, library.
 */
export function InfoTooltip({
  content,
  title,
  side = "top",
  align = "center",
  className,
}: InfoTooltipProps) {
  return (
    <StandardInfoPopover
      content={content}
      title={title}
      side={side}
      align={align}
      className={className}
    />
  );
}
