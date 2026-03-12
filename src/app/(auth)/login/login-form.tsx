"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SignInWithGoogleButton } from "@/components/auth/SignInWithGoogleButton";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "auth_callback_failed") {
      setError("Sign-in failed. Please try again.");
    }
  }, [searchParams]);

  async function handleGoogleLogin() {
    setError(null);
    setGoogleLoading(true);
    const supabase = createClient();
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
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        isLoading={googleLoading}
      />

      {error && (
        <p className="text-center text-sm text-color-signal-red" role="alert">
          {error}
        </p>
      )}

      <p className="text-center text-[12px] text-color-graphite">
        By signing in, you agree to use your Google account. We only use it to
        access your account and don&apos;t post without your permission.
      </p>
    </div>
  );
}
