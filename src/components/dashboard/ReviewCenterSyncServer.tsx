import { getSubjectMasteryData } from "@/lib/actions/mastery-actions";
import { ReviewCenterSyncCard } from "./ReviewCenterSyncCard";
import { createClient, getUser } from "@/lib/supabase/server";

export const ReviewCenterSyncServer = async () => {
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return null;

  const [{ data: profile }, subjectMastery] = await Promise.all([
    supabase
      .from('profiles')
      .select('enrolled_review_center')
      .eq('id', user.id)
      .maybeSingle(),
    getSubjectMasteryData()
  ]);

  return (
    <ReviewCenterSyncCard
      enrolledReviewCenter={profile?.enrolled_review_center ?? null}
      subjectMastery={subjectMastery}
    />
  );
};
