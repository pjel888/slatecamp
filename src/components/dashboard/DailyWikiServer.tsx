import { getDailyWikiData } from "@/lib/actions/stats-actions";
import { DailyWikiCard } from "./FeatureDiscoveryRow";

export const DailyWikiServer = async () => {
  const { dailyArticle, recentNotes } = await getDailyWikiData();

  return <DailyWikiCard article={dailyArticle} notes={recentNotes} />;
};
