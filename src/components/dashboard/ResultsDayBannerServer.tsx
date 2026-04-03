import { createClient, getUser } from "@/lib/supabase/server";
import ResultsDayBanner from "@/app/dashboard/results-day/_components/ResultsDayBanner";

export const ResultsDayBannerServer = async () => {
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

  let showResultsDayBanner = false;
  if (examDateRaw && !aleResult) {
    const daysSinceExam = Math.floor((Date.now() - new Date(examDateRaw).getTime()) / (24 * 60 * 60 * 1000));
    showResultsDayBanner = daysSinceExam >= 3 && daysSinceExam <= 14;
  }

  if (!showResultsDayBanner) return null;

  return <ResultsDayBanner />;
};
