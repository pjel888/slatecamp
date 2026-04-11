import { getHeroData } from "@/lib/actions/stats-actions";
import { WelcomeGuide } from "./WelcomeGuide";

export const WelcomeGuideServer = async () => {
  const data = await getHeroData();

  if (!data) return null;

  // Only show if the user has no practice data yet
  if (data.readinessScore > 0) return null;

  return <WelcomeGuide userName={data.userName} />;
};
