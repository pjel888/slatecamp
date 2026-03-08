"use server";

import { createClient } from "@/lib/supabase/server";
import type { NewSessionType, SessionConfig } from "@/types/app";

export async function createSession(params: {
  examProfileId: string;
  sessionType: NewSessionType;
  config: SessionConfig;
  name?: string;
  sourceSubjectId?: string;
  templateId?: string;
  retakeOfSessionId?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", sessionId: null };

  // Gather questions based on config
  const questionIds: string[] = [];

  if (params.config.specific_question_ids?.length) {
    questionIds.push(...params.config.specific_question_ids);
  } else if (params.config.subjects?.length) {
    for (const subjectConfig of params.config.subjects) {
      let query = supabase
        .from("questions")
        .select("id")
        .eq("subject_id", subjectConfig.subject_id)
        .eq("status", "published");

      if (subjectConfig.difficulty && subjectConfig.difficulty !== "mixed") {
        query = query.eq("difficulty", subjectConfig.difficulty);
      }

      const { data } = await query.limit(subjectConfig.question_count);
      if (data) questionIds.push(...data.map((q: { id: string }) => q.id));
    }
  }

  if (questionIds.length === 0) {
    return { error: "No questions found for the selected criteria", sessionId: null };
  }

  // Shuffle if configured
  if (params.config.shuffle_questions !== false) {
    for (let i = questionIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questionIds[i], questionIds[j]] = [questionIds[j], questionIds[i]];
    }
  }

  // Create session
  const { data: session, error: sessionError } = await supabase
    .from("review_sessions")
    .insert({
      user_id: user.id,
      exam_profile_id: params.examProfileId,
      session_type: params.sessionType,
      config: params.config,
      name: params.name ?? null,
      total_questions: questionIds.length,
      source_subject_id: params.sourceSubjectId ?? null,
      template_id: params.templateId ?? null,
      retake_of_session_id: params.retakeOfSessionId ?? null,
      status: "in_progress",
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    return { error: sessionError?.message ?? "Failed to create session", sessionId: null };
  }

  // Insert session questions
  const sessionQuestions = questionIds.map((qId, index) => ({
    session_id: session.id,
    question_id: qId,
    question_number: index + 1,
  }));

  await supabase.from("session_questions").insert(sessionQuestions);

  return { error: null, sessionId: session.id };
}

export async function submitAnswer(params: {
  sessionQuestionId: string;
  sessionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  responseTimeMs: number;
}) {
  const supabase = await createClient();

  // Update the session question
  await supabase
    .from("session_questions")
    .update({
      selected_answer: params.selectedAnswer,
      is_correct: params.isCorrect,
      response_time_ms: params.responseTimeMs,
      answered_at: new Date().toISOString(),
    })
    .eq("id", params.sessionQuestionId);

  // Update session aggregates
  const { data: session } = await supabase
    .from("review_sessions")
    .select("questions_answered, questions_correct, questions_incorrect, total_time_ms")
    .eq("id", params.sessionId)
    .single();

  if (session) {
    const answered = (session.questions_answered ?? 0) + 1;
    const correct = (session.questions_correct ?? 0) + (params.isCorrect ? 1 : 0);
    const incorrect = (session.questions_incorrect ?? 0) + (params.isCorrect ? 0 : 1);
    const totalTime = (session.total_time_ms ?? 0) + params.responseTimeMs;

    await supabase
      .from("review_sessions")
      .update({
        questions_answered: answered,
        questions_correct: correct,
        questions_incorrect: incorrect,
        total_time_ms: totalTime,
        avg_response_time_ms: Math.round(totalTime / answered),
      })
      .eq("id", params.sessionId);
  }
}

export async function completeSession(sessionId: string) {
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("review_sessions")
    .select("total_questions, questions_answered, questions_correct, total_time_ms")
    .eq("id", sessionId)
    .single();

  if (!session) return;

  const scorePct = session.total_questions > 0
    ? Math.round((session.questions_correct / session.total_questions) * 1000) / 10
    : 0;

  await supabase
    .from("review_sessions")
    .update({
      status: "completed",
      score_percentage: scorePct,
      completed_at: new Date().toISOString(),
    })
    .eq("id", sessionId);
}

export async function markQuestionPresented(sessionQuestionId: string) {
  const supabase = await createClient();
  await supabase
    .from("session_questions")
    .update({ presented_at: new Date().toISOString() })
    .eq("id", sessionQuestionId);
}
