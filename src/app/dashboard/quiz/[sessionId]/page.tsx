import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QuizSession } from "./quiz-session";
import type { Question, Choice } from "@/types/app";

export const metadata = { title: "Quiz Session" };

interface Props {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ timer?: string }>;
}

export default async function QuizSessionPage({ params, searchParams }: Props) {
  const { sessionId } = await params;
  const { timer } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: session } = await supabase
    .from("test_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) redirect("/dashboard/quiz");
  if (session.completed_at) redirect("/dashboard/quiz");

  // Fetch questions based on session config
  let query = supabase
    .from("questions")
    .select("*")
    .eq("status", "published");

  if (session.bank_id) {
    query = query.eq("bank_id", session.bank_id);
  }
  if (session.exam_domain_id) {
    query = query.eq("exam_domain_id", session.exam_domain_id);
  }

  const { data: rawQuestions } = await query
    .limit(session.total_questions || 20)
    .order("sort_order");

  const questions: Question[] = (rawQuestions ?? []).map((q: Record<string, unknown>) => ({
    ...(q as unknown as Question),
    choices: (q.choices as Choice[] | null) ?? [],
    is_multi_select: (q.is_multi_select as boolean) ?? false,
    media_url: (q.media_url as string | null) ?? null,
    explanation_references: (q.explanation_references as string[] | null) ?? [],
    image_urls: (q.image_urls as string[]) ?? [],
    tags: (q.tags as string[]) ?? [],
  }));

  return (
    <QuizSession
      sessionId={sessionId}
      questions={questions}
      timerMinutes={timer ? Number(timer) : undefined}
    />
  );
}
