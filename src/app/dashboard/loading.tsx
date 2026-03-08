import { DashboardPageSkeleton } from "@/components/shared/DashboardPageSkeleton";

/**
 * Shown while any dashboard page is loading (navigation or first load).
 * Uses skeleton screens per design system; no spinners.
 */
export default function DashboardLoading() {
  return <DashboardPageSkeleton />;
}
