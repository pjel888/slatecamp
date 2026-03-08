"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SessionActionResult = { error?: string };

export async function closeSession(sessionId: string): Promise<SessionActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: session } = await supabase
    .from("review_sessions")
    .select("id, status")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) return { error: "Session not found" };
  if (session.status !== "in_progress" && session.status !== "paused") {
    return { error: "Session is not in progress" };
  }

  const { error } = await supabase
    .from("review_sessions")
    .update({
      status: "abandoned",
      completed_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/sessions");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteSession(sessionId: string): Promise<SessionActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: session } = await supabase
    .from("review_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) return { error: "Session not found" };

  const { error } = await supabase
    .from("review_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/sessions");
  revalidatePath("/dashboard");
  return {};
}
