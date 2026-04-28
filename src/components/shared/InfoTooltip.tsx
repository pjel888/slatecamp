import { Info } from '@phosphor-icons/react'

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
  content: _content,
  title,
  side: _side = "top",
  align: _align = "center",
  className,
}: InfoTooltipProps) {
  return (
    <span className={className} title={title ? title : "Info"}>
      <Info size={16} />
    </span>
  );
}
