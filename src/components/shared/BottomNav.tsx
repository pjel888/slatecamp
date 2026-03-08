"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Brain,
  BarChart3,
  Library,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/quiz", label: "Quiz", icon: Brain },
  { href: "/dashboard/analytics", label: "Stats", icon: BarChart3 },
  { href: "/dashboard/library", label: "Library", icon: Library },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
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
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
