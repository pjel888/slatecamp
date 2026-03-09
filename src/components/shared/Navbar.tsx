"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import {
  LayoutDashboard,
  Brain,
  BarChart3,
  Library,
  Box,
  Settings,
  Menu,
  Shield,
  ClipboardList,
  BookOpen,
  Globe,
} from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";

const NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.QUIZ, label: "Quiz", icon: Brain },
  { href: ROUTES.SESSIONS, label: "Sessions", icon: ClipboardList },
  { href: ROUTES.REVIEW, label: "Review", icon: BookOpen },
  { href: ROUTES.ANALYTICS, label: "Analytics", icon: BarChart3 },
  { href: ROUTES.WIKI, label: "Wiki", icon: Globe },
  { href: ROUTES.LIBRARY, label: "Library", icon: Library },
  { href: ROUTES.THREE_D_LAB, label: "3D Lab", icon: Box },
  { href: ROUTES.SETTINGS, label: "Settings", icon: Settings },
];

interface NavbarProps {
  isAdmin?: boolean;
}

export function Navbar({ isAdmin }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="flex h-12 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur-xl lg:hidden">
      <Link
        href={ROUTES.DASHBOARD}
        className="text-lg font-semibold tracking-tight text-foreground"
      >
        Cerebro
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Sheet>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="h-9 w-9" />}
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <nav className="space-y-1 px-3 py-4">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href ||
                  (href !== ROUTES.DASHBOARD && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-all ${
                      isActive
                        ? "bg-secondary font-medium text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    {label}
                  </Link>
                );
              })}

              {isAdmin && (
                <>
                  <div className="my-2 border-t border-border" />
                  <Link
                    href={ROUTES.SETTINGS_DEVELOPER}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-all ${
                      pathname === ROUTES.SETTINGS_DEVELOPER
                        ? "bg-color-signal-amber/10 font-medium text-color-signal-amber"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    <Shield className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    Dev Settings
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
