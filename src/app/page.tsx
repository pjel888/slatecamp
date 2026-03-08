import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Brain, Zap, BarChart3, BookOpen } from "lucide-react";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[980px] items-center justify-between px-6">
          <Link
            href="/"
            className="text-[15px] font-semibold tracking-tight text-foreground"
          >
            Cerebro
          </Link>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="sm" className="text-[13px]">
                  Go to dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-[13px]">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="text-[13px]">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-[980px] px-6 pt-36 pb-24 text-center">
          <h1 className="mx-auto max-w-2xl text-[44px] font-semibold leading-[1.08] tracking-tight text-foreground sm:text-[56px]">
            Your AI study partner
            <br />
            <span className="text-color-signal-amber">
              that never sleeps.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-[17px] leading-relaxed text-muted-foreground">
            Adaptive test prep powered by spaced repetition and AI. Stop
            re-reading — start actively recalling.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="h-11 rounded-full px-7 text-[15px]">
                  Go to dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="h-11 rounded-full px-7 text-[15px]">
                    Start Reviewing — Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-11 rounded-full px-7 text-[15px]"
                  >
                    I have an account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="border-t border-border/40">
          <div className="mx-auto grid max-w-[980px] gap-12 px-6 py-24 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Brain,
                title: "AI-Adaptive",
                desc: "Questions adapt to your ability in real-time using Item Response Theory.",
              },
              {
                icon: Zap,
                title: "Spaced Repetition",
                desc: "The SM-2 algorithm schedules reviews at the optimal moment for retention.",
              },
              {
                icon: BarChart3,
                title: "Deep Analytics",
                desc: "Domain mastery radar, predicted scores, and weak-area identification.",
              },
              {
                icon: BookOpen,
                title: "Question Bank Library",
                desc: "Browse official and community question banks, or create your own.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary">
                  <Icon
                    className="h-5 w-5 text-foreground"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-[15px] font-medium text-foreground">
                  {title}
                </h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[980px] px-6 py-24 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Ready to pass your board exam?
          </h2>
          <p className="mt-3 text-[15px] text-muted-foreground">
            {isLoggedIn
              ? "Head to your dashboard to continue studying."
              : "Free to start. No credit card required."}
          </p>
          <Link
            href={isLoggedIn ? "/dashboard" : "/register"}
            className="mt-8 inline-block"
          >
            <Button size="lg" className="h-11 rounded-full px-7 text-[15px]">
              {isLoggedIn ? "Go to dashboard" : "Create Free Account"}
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-border/40">
        <div className="mx-auto flex h-14 max-w-[980px] items-center justify-between px-6 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Cerebro</span>
          <span className="tracking-wide">Less, but better.</span>
        </div>
      </footer>
    </div>
  );
}
