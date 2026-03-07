import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  children?: ReactNode;
}

export function EmptyState({
  message,
  actionLabel,
  onAction,
  actionHref,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-muted-foreground text-sm">{message}</p>
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-4">
          {actionHref ? (
            <a href={actionHref}>
              <Button>{actionLabel}</Button>
            </a>
          ) : (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
