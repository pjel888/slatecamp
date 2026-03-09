import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";

export const metadata = { title: "Cerebro" };

/** Onboarding removed: app assumes ALE. All users go to dashboard. */
export default function OnboardingPage() {
  redirect(ROUTES.DASHBOARD);
}
