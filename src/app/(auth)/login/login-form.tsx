"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthErrorAlert } from "@/components/auth/AuthErrorAlert";
import { SignInWithGoogleButton } from "@/components/auth/SignInWithGoogleButton";
import { runWithLoading } from "@/hooks/useGlobalLoading";

export function LoginFormInner() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "auth_callback_failed") {
      setError("Sign-in failed. Please try again.");
    }
  }, [searchParams]);

  async function handleGoogleLogin() {
    setError(null);
    await runWithLoading(async () => {
      const supabase = createClient();
      
      const next = searchParams.get("next") || "/dashboard";
      const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
      callbackUrl.searchParams.set("next", next);

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
        onClick={handleGoogleLogin}
      />

      {error && <AuthErrorAlert message={error} />}

      <p className="text-center text-[12px] text-text-secondary">
        By signing in, you agree to use your Google account. We only use it to
        access your account and don&apos;t post without your permission.
      </p>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense key="login-form-suspense" fallback={null}>
      <LoginFormInner />
    </Suspense>
  );
}
