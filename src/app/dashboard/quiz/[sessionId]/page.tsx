import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QuizEngine } from "./quiz-engine";
import type { SessionQuestion, ReviewSession } from "@/types/app";

export const metadata = { title: "Quiz — Cerebro" };

export default async function QuizSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: session } = await supabase
    .from("review_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) redirect("/dashboard");

  if ((session as ReviewSession).status === "completed") {
    redirect(`/dashboard/quiz/${sessionId}/summary`);
  }

  const { data: sessionQuestions } = await supabase
    .from("session_questions")
    .select("*, questions(*)")
    .eq("session_id", sessionId)
    .order("question_number", { ascending: true });

  return (
    <QuizEngine
      session={session as ReviewSession}
      sessionQuestions={(sessionQuestions ?? []) as SessionQuestion[]}
    />
  );
}
