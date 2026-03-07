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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/quiz", label: "Quiz", icon: Brain },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/library", label: "Library", icon: Library },
  { href: "/dashboard/3d-lab", label: "3D Lab", icon: Box },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

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
          <Link
            href="/dashboard"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            Cerebro
          </Link>
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
                <TooltipTrigger render={link} />
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
                  <button
                    onClick={handleLogout}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  </button>
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
