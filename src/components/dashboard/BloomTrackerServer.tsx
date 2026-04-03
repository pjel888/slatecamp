import { getBloomBreakdown } from "@/lib/actions/bloom-tracker";
import { BloomCognitiveTracker } from "./BloomCognitiveTracker";
import { createClient, getUser } from "@/lib/supabase/server";

export const BloomTrackerServer = async () => {
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return null;

  const { count: sessionsCompleted } = await supabase
    .from('quiz_sessions')
    .select('session_id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed');

  const bloomData = sessionsCompleted && sessionsCompleted >= 10 
    ? await getBloomBreakdown() 
    : [];

  return (
    <BloomCognitiveTracker
      data={bloomData}
      sessionsCompleted={sessionsCompleted ?? 0}
    />
  );
};
