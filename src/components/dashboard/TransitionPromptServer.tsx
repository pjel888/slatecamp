import { createClient, getUser } from "@/lib/supabase/server";
import TransitionPrompt from "@/components/dashboard/TransitionPrompt";

export const TransitionPromptServer = async () => {
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return null;

  const [ { data: profile }, { data: globalStats } ] = await Promise.all([
    supabase
      .from('profiles')
      .select('ale_result')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('user_global_stats')
      .select('target_exam_date')
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  const aleResult = profile?.ale_result ?? null;
  const examDateRaw = globalStats?.target_exam_date ?? null;

  let daysUntilExam: number | null = null;
  if (examDateRaw) {
    const diff = new Date(examDateRaw).getTime() - Date.now();
    daysUntilExam = Math.ceil(diff / (24 * 60 * 60 * 1000));
  }

  const showPasserTransition = aleResult === 'passed' && daysUntilExam !== null && daysUntilExam < -3;
  const showOptInTransition = aleResult === 'failed' && daysUntilExam !== null && daysUntilExam < -30;

  if (showPasserTransition) return <TransitionPrompt variant="passed" />;
  if (showOptInTransition) return <TransitionPrompt variant="opt-in" />;

  return null;
};
