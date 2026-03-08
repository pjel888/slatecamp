"use client";

import { createClient } from "@/lib/supabase/client";

let currentLogId: string | null = null;
let startTime: number | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let isPaused = false;

const IDLE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);
  if (isPaused) resumeTracking();
  idleTimer = setTimeout(() => {
    isPaused = true;
  }, IDLE_TIMEOUT_MS);
}

function resumeTracking() {
  isPaused = false;
  startTime = Date.now();
}

export async function startStudyTimeTracking(
  examProfileId: string,
  mode: "review" | "session" | "3d_library" | "tutor",
  sessionId?: string
) {
  const supabase = createClient();

  const { data } = await supabase
    .from("study_time_logs")
    .insert({
      exam_profile_id: examProfileId,
      mode,
      session_id: sessionId ?? null,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (data) {
    currentLogId = data.id;
    startTime = Date.now();
    isPaused = false;
  }

  // Idle detection
  if (typeof window !== "undefined") {
    const events = ["mousemove", "keydown", "touchstart", "scroll"];
    events.forEach((event) => {
      window.addEventListener(event, resetIdleTimer, { passive: true });
    });
    resetIdleTimer();

    window.addEventListener("beforeunload", () => {
      stopStudyTimeTracking();
    });
  }

  return currentLogId;
}

export async function stopStudyTimeTracking() {
  if (!currentLogId || !startTime) return;

  const supabase = createClient();
  const durationMs = isPaused ? 0 : Date.now() - startTime;

  await supabase
    .from("study_time_logs")
    .update({
      ended_at: new Date().toISOString(),
      duration_ms: durationMs,
    })
    .eq("id", currentLogId);

  if (idleTimer) clearTimeout(idleTimer);
  currentLogId = null;
  startTime = null;
  isPaused = false;
}
