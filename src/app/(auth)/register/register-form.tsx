"use client";

import { useState } from "react";
import { Warning } from "@phosphor-icons/react";
import { SCIcon } from "@/components/graphics/icons/Icon";
import { createClient } from "@/lib/supabase/client";
import { SignInWithGoogleButton } from "@/components/auth/SignInWithGoogleButton";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const supabase = createClient();

  async function handleGoogleSignUp() {
    setError(null);
    setGoogleLoading(true);
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
    callbackUrl.searchParams.set("next", "/onboarding");

    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
      return;
    }
    if (data?.url) {
      window.location.href = data.url;
      return;
    }
    setGoogleLoading(false);
  }

  return (
    <div className="space-y-4">
      <SignInWithGoogleButton
        onClick={handleGoogleSignUp}
        disabled={googleLoading}
        isLoading={googleLoading}
      />

      {error && (
        <div className="flex items-start gap-2 text-sm text-destructive" role="alert">
          <SCIcon icon={Warning} size="sm" className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-center text-[12px] text-text-secondary">
        By continuing, you agree to sign in with your Google account. We only
        use it to create your account and don&apos;t post without your
        permission.
      </p>
    </div>
  );
}
