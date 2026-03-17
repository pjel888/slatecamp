"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SignInWithGoogleButton } from "@/components/auth/SignInWithGoogleButton";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const supabase = createClient();

  async function handleGoogleSignUp() {
    setError(null);
    setGoogleLoading(true);
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
        <div className="flex items-start gap-2 text-sm text-red-600" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-center text-[12px] text-color-graphite">
        By continuing, you agree to sign in with your Google account. We only
        use it to create your account and don&apos;t post without your
        permission.
      </p>
    </div>
  );
}
