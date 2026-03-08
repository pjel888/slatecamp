"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, BookOpen, ClipboardList } from "lucide-react";
import { useBreadcrumb } from "@/lib/context/breadcrumb-context";

/** Path segment to display label; last segment is current page. */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  quiz: "Quiz",
  analytics: "Analytics",
  library: "Library",
  "3d-lab": "3D Lab",
  settings: "Settings",
  sessions: "Sessions",
  review: "Review",
  "new": "New",
  summary: "Summary",
  billing: "Billing",
  developer: "Dev Settings",
  onboarding: "Onboarding",
  marketplace: "Marketplace",
};

function getBreadcrumbs(pathname: string): { href: string; label: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  // Skip "dashboard" so breadcrumbs show pages as standalone (e.g. "Analytics" not "Dashboard > Analytics")
  const start = segments[0] === "dashboard" ? 1 : 0;
  if (start >= segments.length) return [];
  const crumbs: { href: string; label: string }[] = [];
  const uuidLike = /^[0-9a-f-]{20,}$/i;
  let href = start === 1 ? "/dashboard" : "";
  for (let i = start; i < segments.length; i++) {
    href += (href ? "/" : "") + segments[i];
    let label = SEGMENT_LABELS[segments[i]];
    if (label == null) label = uuidLike.test(segments[i]) ? "Session" : segments[i];
    crumbs.push({ href, label });
  }
  return crumbs;
}

function getMode(pathname: string): "review" | "quiz" | null {
  if (pathname.startsWith("/dashboard/review")) return "review";
  if (pathname.startsWith("/dashboard/quiz")) return "quiz";
  return null;
}

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { breadcrumbs: customCrumbs } = useBreadcrumb() ?? {};
  const mode = getMode(pathname);
  const inQuizMode = mode !== null;
  const crumbs = inQuizMode ? null : (customCrumbs ?? getBreadcrumbs(pathname));
  const showBack = !inQuizMode && crumbs && crumbs.length > 1;

  return (
    <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-3 border-b border-border/40 bg-background/95 px-4 backdrop-blur-sm">
      {showBack && (
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>
      )}
      {mode && (
        <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1">
          {mode === "review" ? (
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
          ) : (
            <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
          )}
          <span className="text-xs font-medium text-foreground">
            {mode === "review" ? "Review mode" : "Quiz mode"}
          </span>
        </div>
      )}
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1 text-sm">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <span key={crumb.href} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" strokeWidth={1.5} />
                )}
                {isLast ? (
                  <span className="truncate font-medium text-foreground">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="truncate text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      )}
    </header>
  );
}
