"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Brain,
  BarChart3,
  Library,
  Settings,
} from "lucide-react";
import { getQuizReviewMode } from "@/lib/utils/quiz-review-mode";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/quiz", label: "Quiz", icon: Brain },
  { href: "/dashboard/analytics", label: "Stats", icon: BarChart3 },
  { href: "/dashboard/library", label: "Library", icon: Library },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState<string>("/dashboard");
  const mode = getQuizReviewMode(pathname);

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (mode && href !== pathname) {
      e.preventDefault();
      setLeaveTarget(href);
      setLeaveDialogOpen(true);
    }
  }

  function handleConfirmLeave() {
    setLeaveDialogOpen(false);
    router.push(leaveTarget);
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/80 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] transition-all ${
                  isActive
                    ? "text-color-signal-amber"
                    : "text-muted-foreground"
                }`}
                onClick={(e) => handleNavClick(e, href)}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {mode && (
        <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
          <DialogContent showCloseButton={false} className="sm:max-w-[380px]">
            <DialogTitle>Are you sure you want to exit?</DialogTitle>
            <DialogDescription>
              Your progress in this {mode === "review" ? "review" : "quiz"} will not be saved. You can come back anytime.
            </DialogDescription>
            <DialogFooter className="mt-4 gap-2 border-t border-border bg-muted/30 p-4 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setLeaveDialogOpen(false)}
                className="flex-1 sm:flex-initial"
              >
                No, stay
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmLeave}
                className="flex-1 sm:flex-initial"
              >
                Yes, exit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
