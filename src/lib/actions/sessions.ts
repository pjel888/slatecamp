"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { sessionIdSchema } from "@/lib/validations";

export type SessionActionResult = { error?: string };

/**
 * Closes a session by marking it abandoned.
 * Refactored for Phase 3 schema (quiz_sessions).
 */
export async function closeSession(sessionId: string): Promise<SessionActionResult> {
  const parseResult = sessionIdSchema.safeParse({ sessionId });
  if (!parseResult.success) {
    return { error: "Invalid session ID format" };
  }

  const { sessionId: validSessionId } = parseResult.data;
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: session } = await supabase
    .from("quiz_sessions")
    .select("session_id, status")
    .eq("session_id", validSessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) return { error: "Session not found" };
  if (session.status !== "in_progress") {
    return { error: "Session is not in progress" };
  }

  const { error } = await supabase
    .from("quiz_sessions")
    .update({
      status: "abandoned",
      updated_at: new Date().toISOString(),
    })
    .eq("session_id", validSessionId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/drills");
  revalidatePath("/dashboard");
  return {};
}

/**
 * Deletes a quiz session.
 */
export async function deleteSession(sessionId: string): Promise<SessionActionResult> {
  const parseResult = sessionIdSchema.safeParse({ sessionId });
  if (!parseResult.success) {
    return { error: "Invalid session ID format" };
  }

  const { sessionId: validSessionId } = parseResult.data;
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("quiz_sessions")
    .delete()
    .eq("session_id", validSessionId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/drills");
  revalidatePath("/dashboard");
  return {};
}
