"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthErrorAlert } from "@/components/auth/AuthErrorAlert";
import { SignInWithGoogleButton } from "@/components/auth/SignInWithGoogleButton";
import { runWithLoading } from "@/hooks/useGlobalLoading";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleGoogleSignUp() {
    setError(null);
    await runWithLoading(async () => {
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
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    }, 'Redirecting to Google…');
  }

  return (
    <div className="space-y-4">
      <SignInWithGoogleButton
        onClick={handleGoogleSignUp}
      />

      {error && <AuthErrorAlert message={error} />}

      <p className="text-center text-[12px] text-text-secondary">
        By continuing, you agree to sign in with your Google account. We only
        use it to create your account and don&apos;t post without your
        permission.
      </p>
    </div>
  );
}
