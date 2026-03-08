/**
 * Whether the user is in "Quiz mode" (active session) or "Review mode" (doomscroll feed).
 * Used for showing the exit warning when navigating away via sidebar or bottom nav.
 */
export function getQuizReviewMode(pathname: string): "quiz" | "review" | null {
  if (pathname.startsWith("/dashboard/review")) return "review";
  if (!pathname.startsWith("/dashboard/quiz")) return null;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 3) return null;
  if (segments[2] === "new") return null;
  return "quiz";
}
