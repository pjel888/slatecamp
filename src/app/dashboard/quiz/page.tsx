import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAdminAwareProfile } from "@/lib/admin/get-admin-profile";
import { QuizSetupForm } from "./quiz-setup-form";

export const metadata = { title: "Quiz" };

const QUIZ_MODES = [
  {
    id: "practice",
    label: "Practice",
    desc: "Untimed, immediate feedback with explanations.",
    iconName: "brain" as const,
    tier: "free" as const,
    details: {
      howItWorks: [
        "Answer at your own pace — no timer",
        "See instant feedback after confirming each answer",
        "Full explanations and references provided",
        "Great for learning new material",
      ],
      bestFor: "Building foundational knowledge",
    },
  },
  {
    id: "timed_test",
    label: "Timed Test",
    desc: "Simulate real exam conditions with a timer.",
    iconName: "clock" as const,
    tier: "free" as const,
    details: {
      howItWorks: [
        "Set a time limit that mirrors the real exam",
        "No feedback until the session is complete",
        "Results and analytics shown after submission",
        "Tracks your time-per-question performance",
      ],
      bestFor: "Exam simulation and time management practice",
    },
  },
  {
    id: "review",
    label: "SRS Review",
    desc: "Questions from your spaced repetition queue.",
    iconName: "zap" as const,
    tier: "pro" as const,
    details: {
      howItWorks: [
        "Uses SM-2 spaced repetition algorithm",
        "Surfaces questions you're about to forget",
        "Intervals adapt based on your performance",
        "Optimizes long-term retention efficiently",
      ],
      bestFor: "Maximizing memory retention before exams",
    },
  },
  {
    id: "ai_adaptive",
    label: "AI Adaptive",
    desc: "IRT-driven difficulty targeting P(correct) ≈ 0.75.",
    iconName: "target" as const,
    tier: "max" as const,
    details: {
      howItWorks: [
        "Uses Item Response Theory (IRT) psychometric model",
        "Adapts question difficulty to your ability level (θ)",
        "Targets the zone of proximal development",
        "Provides the most efficient learning path",
      ],
      bestFor: "Advanced learners preparing for mastery",
    },
  },
];

export default async function QuizPage() {
  const profile = await getAdminAwareProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();

  const { data: banks } = await supabase
    .from("question_banks")
    .select("id, title, question_count, status, is_official, description")
    .eq("status", "published")
    .order("is_official", { ascending: false })
    .order("title");

  const { data: savedConfigs } = await supabase
    .from("review_session_configs")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_saved", true)
    .order("updated_at", { ascending: false })
    .limit(10);

  const { data: recentSessions } = await supabase
    .from("test_sessions")
    .select("id, session_type, total_questions, correct_answers, score_percentage, session_config, completed_at, created_at")
    .eq("user_id", profile.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Review Sessions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Build a custom review session from your question banks, or use a saved configuration.
        </p>
      </div>

      <QuizSetupForm
        userId={profile.id}
        userTier={profile.effectiveTier}
        banks={
          (banks ?? []).map((b: Record<string, unknown>) => ({
            id: b.id as string,
            title: b.title as string,
            description: (b.description as string | null) ?? null,
            question_count: b.question_count as number,
            is_official: (b.is_official as boolean) ?? false,
          }))
        }
        quizModes={QUIZ_MODES}
        savedConfigs={
          (savedConfigs ?? []).map((c: Record<string, unknown>) => ({
            id: c.id as string,
            name: c.name as string,
            bank_configs: c.bank_configs as { bankId: string; bankTitle: string; questionCount: number }[],
            session_type: c.session_type as string,
            total_questions: c.total_questions as number,
          }))
        }
        recentSessions={
          (recentSessions ?? []).map((s: Record<string, unknown>) => ({
            id: s.id as string,
            session_type: s.session_type as string,
            total_questions: s.total_questions as number,
            correct_answers: s.correct_answers as number,
            score_percentage: s.score_percentage as number | null,
            session_config: s.session_config as { bankId: string; bankTitle: string; questionCount: number }[] | null,
            completed_at: s.completed_at as string,
          }))
        }
      />
    </div>
  );
}
