"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HelpCircle } from "lucide-react";

/**
 * Standard info popover matching the SRS Review / Quiz mode tooltip design.
 * Use everywhere for consistent "?" icon + card-style content (hover to open on desktop).
 * Trigger: question mark icon. Content: rounded card with border and shadow.
 */
export const STANDARD_INFO_POPOVER_CONTENT_CLASS =
  "w-80 rounded-xl border border-border bg-card p-4 shadow-lg text-sm text-foreground";

interface StandardInfoPopoverProps {
  /** Content (plain text or JSX). */
  content: React.ReactNode;
  /** Optional title above content. */
  title?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
}

export function StandardInfoPopover({
  content,
  title,
  side = "top",
  align = "center",
  className,
}: StandardInfoPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger
        className={
          className ??
          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        }
        aria-label="More info"
      >
        <HelpCircle className="h-4 w-4" strokeWidth={1.5} />
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={8}
        className={STANDARD_INFO_POPOVER_CONTENT_CLASS}
      >
        {title && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
        )}
        <div className="leading-relaxed text-foreground/90">{content}</div>
      </PopoverContent>
    </Popover>
  );
}
