import { getHeroData } from "@/lib/actions/stats-actions";
import { HeroCommandBar, HeroCommandBarSkeleton } from "./HeroCommandBar";
import { type ReactNode } from "react";

export const HeroCommandBarServer = async ({ children }: { children?: ReactNode }) => {
  const data = await getHeroData();

  if (!data) return <HeroCommandBarSkeleton />;

  return (
    <HeroCommandBar
      userName={data.userName}
      readinessScore={data.readinessScore}
      previousScore={data.previousScore}
      daysUntilExam={data.daysUntilExam}
      heroStats={data.heroStats}
      syllabusCoveragePercent={data.syllabusCoveragePercent}
      readinessMeta={data.readinessMeta}
    >
      {children}
    </HeroCommandBar>
  );
};
