"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Brain,
  BarChart3,
  Library,
  Box,
  Settings,
  LogOut,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  User,
  ClipboardList,
  BookOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { ExamProfileSwitcher } from "./ExamProfileSwitcher";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TierBadge, type DisplayTier } from "@/components/shared/TierBadge";
import type { UserTier } from "@/types/app";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/quiz", label: "Quiz", icon: Brain },
  { href: "/dashboard/sessions", label: "Sessions", icon: ClipboardList },
  { href: "/dashboard/review", label: "Review", icon: BookOpen },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/library", label: "Library", icon: Library },
  { href: "/dashboard/3d-lab", label: "3D Lab", icon: Box },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function getInitials(name: string, email?: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
}

interface SidebarProps {
  isAdmin?: boolean;
  userDisplay?: { name: string; avatarUrl: string | null };
  /** Display tier (free, pro, max, or "dev" for dev mode). */
  tier?: UserTier | "dev";
}

export function Sidebar({ isAdmin, userDisplay, tier = "free" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const displayName = userDisplay?.name ?? "User";
  const initials = getInitials(displayName);
  const displayTier = tier as DisplayTier;

  useEffect(() => {
    const stored = localStorage.getItem("cerebro_sidebar_collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("cerebro_sidebar_collapsed", String(next));
      return next;
    });
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={`hidden lg:flex lg:flex-col lg:border-r lg:border-border/40 lg:bg-sidebar transition-all duration-300 ease-in-out ${
        collapsed ? "lg:w-[68px]" : "lg:w-[260px]"
      }`}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border/40 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              Cerebro
            </Link>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground ${
            collapsed ? "mx-auto" : ""
          }`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <PanelLeftClose className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* User profile — below logo */}
      <div className="border-b border-border/40 px-2 py-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard/settings"
                className="flex justify-center"
                aria-label="Settings"
              >
                <Avatar className="size-9">
                  {userDisplay?.avatarUrl ? (
                    <AvatarImage src={userDisplay.avatarUrl} alt="" />
                  ) : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {displayName}
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            <Link href="/dashboard/settings" className="shrink-0 rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="size-9">
                {userDisplay?.avatarUrl ? (
                  <AvatarImage src={userDisplay.avatarUrl} alt="" />
                ) : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <User className="h-3.5 w-3.5" strokeWidth={1.5} />
                Settings
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Plan indicator + upgrade CTA */}
      {!collapsed && (
        <div className="border-b border-border/40 px-2 py-2">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-2">
            <TierBadge tier={displayTier} size="sm" />
            {tier === "free" && (
              <Link href="/dashboard/settings/billing">
                <Button variant="outline" size="sm" className="h-7 gap-1 text-[11px] px-2">
                  <Sparkles className="h-3 w-3" strokeWidth={1.5} />
                  Upgrade
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
      {collapsed && tier === "free" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/dashboard/settings/billing" className="flex justify-center py-2" aria-label="Upgrade to Pro">
              <Sparkles className="h-4 w-4 text-[var(--color-signal-amber)]" strokeWidth={1.5} />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Upgrade to Pro
          </TooltipContent>
        </Tooltip>
      )}

      {/* Exam Profile Switcher */}
      {!collapsed && (
        <div className="border-b border-border/40 px-2 py-2">
          <ExamProfileSwitcher />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

          const link = (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-all ${
                collapsed ? "justify-center px-0" : ""
              } ${
                isActive
                  ? "bg-secondary font-medium text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
              {!collapsed && label}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={href}>
                <TooltipTrigger render={<span className="block">{link}</span>} />
                <TooltipContent side="right" sideOffset={8}>
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return link;
        })}

        {isAdmin && (
          <>
            <div className="my-2 border-t border-border/40" />
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span className="block">
                      <Link
                        href="/dashboard/settings/developer"
                        className={`flex items-center justify-center rounded-xl py-2 text-[13px] transition-all ${
                          pathname === "/dashboard/settings/developer"
                            ? "bg-[var(--color-signal-amber)]/10 font-medium text-[var(--color-signal-amber)]"
                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                        }`}
                      >
                        <Shield className="h-[18px] w-[18px]" strokeWidth={1.5} />
                      </Link>
                    </span>
                  }
                />
                <TooltipContent side="right" sideOffset={8}>
                  Dev Settings
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                href="/dashboard/settings/developer"
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-all ${
                  pathname === "/dashboard/settings/developer"
                    ? "bg-[var(--color-signal-amber)]/10 font-medium text-[var(--color-signal-amber)]"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <Shield className="h-[18px] w-[18px]" strokeWidth={1.5} />
                Dev Settings
              </Link>
            )}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/40 p-2">
        <div className={`flex items-center ${collapsed ? "flex-col gap-2 py-2" : "justify-between px-3 py-2"}`}>
          <ThemeToggle />
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-all hover:text-foreground"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              Log out
            </button>
          )}
          {collapsed && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className="block">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </span>
                }
              />
              <TooltipContent side="right" sideOffset={8}>
                Log out
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </aside>
  );
}
