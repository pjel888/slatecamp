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

  const { data: domains } = await supabase
    .from("exam_domains")
    .select("id, name, slug")
    .eq("profession", profile.profession ?? "architecture")
    .order("sort_order");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Start a Quiz</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your quiz mode, select question banks, and configure your session.
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
        domains={domains ?? []}
        quizModes={QUIZ_MODES}
      />
    </div>
  );
}
