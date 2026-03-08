"use server";

import { createClient } from "@/lib/supabase/server";

export async function fetchReviewQuestions(params: {
  examProfileId: string;
  subjectId?: string;
  cursor?: string;
  limit?: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { questions: [], nextCursor: null };

  const limit = params.limit ?? 10;

  let query = supabase
    .from("questions")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (params.subjectId) {
    query = query.eq("subject_id", params.subjectId);
  }

  if (params.cursor) {
    query = query.lt("created_at", params.cursor);
  }

  const { data: questions, error } = await query;

  if (error || !questions) return { questions: [], nextCursor: null };

  const nextCursor =
    questions.length === limit
      ? questions[questions.length - 1].created_at
      : null;

  return { questions, nextCursor };
}

export async function logReviewInteraction(params: {
  examProfileId: string;
  questionId: string;
  initialTapCorrect: boolean | null;
  timeOnQuestionMs: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("review_mode_interactions").insert({
    user_id: user.id,
    exam_profile_id: params.examProfileId,
    question_id: params.questionId,
    initial_tap_correct: params.initialTapCorrect,
    time_on_question_ms: params.timeOnQuestionMs,
  });
}
