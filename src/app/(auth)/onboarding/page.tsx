import { redirect } from "next/navigation";

export const metadata = { title: "Cerebro" };

/** Onboarding removed: app assumes ALE. All users go to dashboard. */
export default function OnboardingPage() {
  redirect("/dashboard");
}
