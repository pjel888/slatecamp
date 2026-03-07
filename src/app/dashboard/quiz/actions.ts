"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateNextReview, getQuality, getNextReviewDate } from "@/lib/srs/sm2";

export async function createQuizSession(config: {
  userId: string;
  bankConfigs: { bankId: string; bankTitle: string; questionCount: number }[];
  mode: string;
  totalQuestions: number;
  configId?: string;
}) {
  const supabase = await createClient();

  const primaryBankId = config.bankConfigs.length === 1 ? config.bankConfigs[0].bankId : null;

  const { data } = await supabase
    .from("test_sessions")
    .insert({
      user_id: config.userId,
      bank_id: primaryBankId,
      exam_domain_id: null,
      config_id: config.configId ?? null,
      session_config: config.bankConfigs,
      session_type: config.mode,
      total_questions: config.totalQuestions,
      correct_answers: 0,
      total_time_ms: 0,
      score_percentage: null,
      difficulty_mode: "mixed",
      completed_at: null,
    })
    .select("id")
    .single();

  return data as { id: string } | null;
}

export async function saveReviewConfig(config: {
  userId: string;
  name: string;
  bankConfigs: { bankId: string; bankTitle: string; questionCount: number }[];
  mode: string;
  totalQuestions: number;
}) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("review_session_configs")
    .insert({
      user_id: config.userId,
      name: config.name,
      bank_configs: config.bankConfigs,
      session_type: config.mode,
      total_questions: config.totalQuestions,
      is_saved: true,
    })
    .select("id, name")
    .single();

  return data as { id: string; name: string } | null;
}

export async function deleteReviewConfig(configId: string) {
  const supabase = await createClient();
  await supabase.from("review_session_configs").delete().eq("id", configId);
}

export async function createCustomBank(config: {
  userId: string;
  title: string;
  description: string | null;
}) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("question_banks")
    .insert({
      creator_id: config.userId,
      title: config.title,
      description: config.description,
      profession: "architecture",
      is_official: false,
      status: "published",
      question_count: 0,
    })
    .select("id, title, description")
    .single();

  return data as { id: string; title: string; description: string | null } | null;
}

export async function submitAnswer(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const questionId = formData.get("questionId") as string;
  const sessionId = formData.get("sessionId") as string;
  const selectedAnswer = formData.get("selectedAnswer") as string;
  const responseTimeMs = Number(formData.get("responseTimeMs") ?? 0);
  const correctAnswer = formData.get("correctAnswer") as string;
  const examDomainId = formData.get("examDomainId") as string | null;

  const normalize = (s: string) => s.split(",").map((x) => x.trim()).sort().join(",");
  const isCorrect = normalize(selectedAnswer) === normalize(correctAnswer);

  // 1. Log response
  await supabase.from("user_responses").insert({
    user_id: user.id,
    question_id: questionId,
    session_id: sessionId,
    selected_answer: selectedAnswer,
    is_correct: isCorrect,
    response_time_ms: responseTimeMs,
  });

  // 2. Update question stats
  await supabase.rpc("increment_question_stats", {
    q_id: questionId,
    was_correct: isCorrect,
  }).then(() => {}, () => {
    // RPC may not exist yet — silently ignore
  });

  // 3. Update SRS queue
  const { data: existingSrs } = await supabase
    .from("srs_queue")
    .select("*")
    .eq("user_id", user.id)
    .eq("question_id", questionId)
    .single();

  const quality = getQuality(isCorrect, responseTimeMs);

  if (existingSrs) {
    const result = calculateNextReview(
      quality,
      existingSrs.repetition_count,
      existingSrs.ease_factor,
      existingSrs.interval_days
    );
    await supabase
      .from("srs_queue")
      .update({
        interval_days: result.interval,
        ease_factor: result.easeFactor,
        repetition_count: result.repetitions,
        lapses: isCorrect
          ? existingSrs.lapses
          : existingSrs.lapses + 1,
        last_quality: quality,
        next_review_at: getNextReviewDate(result.interval).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingSrs.id);
  } else {
    const result = calculateNextReview(quality, 0, 2.5, 0);
    await supabase.from("srs_queue").insert({
      user_id: user.id,
      question_id: questionId,
      interval_days: result.interval,
      ease_factor: result.easeFactor,
      repetition_count: result.repetitions,
      last_quality: quality,
      next_review_at: getNextReviewDate(result.interval).toISOString(),
    });
  }

  // 4. Update session stats
  await supabase
    .from("test_sessions")
    .update({
      correct_answers: isCorrect
        ? (await supabase
            .from("test_sessions")
            .select("correct_answers")
            .eq("id", sessionId)
            .single()
            .then((r: { data: Record<string, number> | null }) => (r.data?.correct_answers ?? 0) + 1))
        : undefined,
    })
    .eq("id", sessionId);

  // 5. Update domain mastery
  if (examDomainId) {
    const { data: mastery } = await supabase
      .from("domain_mastery")
      .select("*")
      .eq("user_id", user.id)
      .eq("exam_domain_id", examDomainId)
      .single();

    if (mastery) {
      const newAttempted = mastery.total_attempted + 1;
      const newCorrect = mastery.total_correct + (isCorrect ? 1 : 0);
      await supabase
        .from("domain_mastery")
        .update({
          total_attempted: newAttempted,
          total_correct: newCorrect,
          mastery_score: (newCorrect / newAttempted) * 100,
          last_practiced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", mastery.id);
    } else {
      await supabase.from("domain_mastery").insert({
        user_id: user.id,
        exam_domain_id: examDomainId,
        total_attempted: 1,
        total_correct: isCorrect ? 1 : 0,
        mastery_score: isCorrect ? 100 : 0,
        last_practiced_at: new Date().toISOString(),
      });
    }
  }

  return { isCorrect };
}

export async function completeSession(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: responses } = await supabase
    .from("user_responses")
    .select("is_correct, response_time_ms")
    .eq("session_id", sessionId)
    .eq("user_id", user.id);

  if (!responses) return null;

  const typedResponses = responses as { is_correct: boolean; response_time_ms: number | null }[];
  const total = typedResponses.length;
  const correct = typedResponses.filter((r) => r.is_correct).length;
  const totalTime = typedResponses.reduce(
    (sum: number, r) => sum + (r.response_time_ms ?? 0),
    0
  );

  await supabase
    .from("test_sessions")
    .update({
      total_questions: total,
      correct_answers: correct,
      total_time_ms: totalTime,
      score_percentage: total > 0 ? (correct / total) * 100 : 0,
      completed_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  // Update daily stats
  const today = new Date().toISOString().split("T")[0];
  const { data: existingStats } = await supabase
    .from("daily_user_stats")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  if (existingStats) {
    await supabase
      .from("daily_user_stats")
      .update({
        questions_attempted:
          existingStats.questions_attempted + total,
        questions_correct: existingStats.questions_correct + correct,
        total_study_time_ms: existingStats.total_study_time_ms + totalTime,
        streak_maintained: true,
      })
      .eq("id", existingStats.id);
  } else {
    await supabase.from("daily_user_stats").insert({
      user_id: user.id,
      date: today,
      questions_attempted: total,
      questions_correct: correct,
      total_study_time_ms: totalTime,
      streak_maintained: true,
    });
  }

  return {
    total,
    correct,
    totalTime,
    scorePercentage: total > 0 ? (correct / total) * 100 : 0,
  };
}
