"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SessionList } from "@/app/dashboard/sessions/session-list";
import type { ReviewSession } from "@/types/app";

interface SessionsTabProps {
  sessions: ReviewSession[];
}

export function SessionsTab({ sessions }: SessionsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Your quiz history and session management
        </p>
        <Link href="/dashboard/sessions/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            New Session
          </Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No sessions yet. Create your first session to start tracking your progress.
            </p>
            <Link href="/dashboard/sessions/new">
              <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                Create Session
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <SessionList sessions={sessions} />
      )}
    </div>
  );
}
