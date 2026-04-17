"use client";

import { useState } from "react";
import Link from "next/link";
import { Warning } from "@phosphor-icons/react";
import { SCIcon } from "@/components/graphics/icons/Icon";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/routes";
import { siteConfig } from "@/lib/constants/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/auth/callback?next=/settings` }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link
            href={ROUTES.home}
            className="text-lg font-semibold text-foreground"
          >
            {siteConfig.name}
          </Link>
          <h1 className="mt-6 text-xl font-semibold text-foreground">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {sent
              ? "Check your email for a reset link."
              : "Enter your email and we'll send a reset link."}
          </p>
        </div>

        {!sent && (
          <div className="rounded-md border border-border bg-card p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-destructive" role="alert">
                  <SCIcon icon={Warning} size="sm" className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href={ROUTES.auth.login}
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
