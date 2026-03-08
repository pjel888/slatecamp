"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock, ChevronRight, MoreVertical, XCircle, Trash2 } from "lucide-react";
import { closeSession, deleteSession } from "@/lib/actions/sessions";
import type { ReviewSession } from "@/types/app";

interface SessionListProps {
  sessions: ReviewSession[];
}

export function SessionList({ sessions }: SessionListProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleClose(sessionId: string) {
    setPendingId(sessionId);
    const result = await closeSession(sessionId);
    setPendingId(null);
    if (result.error) return;
    router.refresh();
  }

  async function handleDelete(sessionId: string) {
    if (!confirm("Delete this session? This cannot be undone.")) return;
    setPendingId(sessionId);
    const result = await deleteSession(sessionId);
    setPendingId(null);
    if (result.error) return;
    router.refresh();
  }

  if (sessions.length === 0) return null;

  return (
    <div className="space-y-3">
      {sessions.map((s) => {
        const scorePct = s.score_percentage != null ? Math.round(s.score_percentage) : null;
        const totalMin = Math.round((s.total_time_ms ?? 0) / 60000);
        const isCompleted = s.status === "completed";
        const canClose = s.status === "in_progress" || s.status === "paused";
        const isPending = pendingId === s.id;

        return (
          <Card key={s.id} className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {s.name ?? s.session_type.replace(/_/g, " ")}
                  </span>
                  <Badge
                    variant={isCompleted ? "secondary" : "default"}
                    className="shrink-0 text-xs capitalize"
                  >
                    {s.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{new Date(s.created_at).toLocaleDateString()}</span>
                  <span>{s.total_questions} questions</span>
                  {totalMin > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" strokeWidth={1.5} />
                      {totalMin}m
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {scorePct !== null && (
                  <span className="text-xl font-semibold font-mono text-foreground">
                    {scorePct}%
                  </span>
                )}
                {isCompleted ? (
                  <Link href={`/dashboard/quiz/${s.id}/summary`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      Details <ChevronRight className="h-3 w-3" />
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/dashboard/quiz/${s.id}`}>
                    <Button size="sm" className="gap-1">
                      Resume <ChevronRight className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      aria-label="Session actions"
                      disabled={isPending}
                    >
                      <MoreVertical className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canClose && (
                      <DropdownMenuItem
                        onClick={() => handleClose(s.id)}
                        disabled={isPending}
                      >
                        <XCircle className="h-4 w-4" strokeWidth={1.5} />
                        Close session
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => handleDelete(s.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      Delete session
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
