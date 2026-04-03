import { getActivityFeedData } from "@/lib/actions/session-actions";
import { ImprovedActivityFeed } from "./ImprovedActivityFeed";

export const ActivityFeedServer = async () => {
  const sessions = await getActivityFeedData();

  return <ImprovedActivityFeed sessions={sessions} />;
};
