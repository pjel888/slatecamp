import { getStreakData } from "@/lib/actions/stats-actions";
import { StreakRibbon } from "./StreakRibbon";

export const StreakRibbonServer = async () => {
  const { currentStreak, streakStatus } = await getStreakData();

  return (
    <StreakRibbon
      currentStreak={currentStreak}
      streakStatus={streakStatus}
    />
  );
};
