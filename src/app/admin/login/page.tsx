"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SignInWithGoogleButton } from "@/components/auth/SignInWithGoogleButton";
import { Eyebrow } from "@/components/ui/eyebrow";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export default function AdminLandingPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAdminLogin() {
    setError(null);
    setLoading(true);
    const supabase = createClient();

    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${ROUTES.auth.callback}?next=${ROUTES.admin.dashboard}`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
      return;
    }
    if (data?.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-light px-6">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center">
          <Link href={ROUTES.home} className="text-xl font-bold text-text-primary">
            SLATECAMP <span className="text-text-tertiary">ADMIN</span>
          </Link>
          <h1 className="mt-6 text-xl font-semibold text-text-primary">Staff Portal</h1>
          <p className="mt-2 text-sm text-text-secondary">Authorized personnel only.</p>
        </div>

        <div className="rounded-md border border-border bg-card p-8 shadow-sm">
          <SignInWithGoogleButton
            onClick={handleAdminLogin}
            disabled={loading}
            isLoading={loading}
          />
          {error && <p className="mt-4 text-center text-xs text-destructive">{error}</p>}
        </div>

        <Eyebrow className="block text-center">Secure Environment</Eyebrow>
      </div>
    </div>
  );
}
