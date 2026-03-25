"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SignInWithGoogleButton } from "@/components/auth/SignInWithGoogleButton";
import { Eyebrow } from "@/components/ui/eyebrow";
import Link from "next/link";

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
        redirectTo: `${window.location.origin}/auth/callback?next=/admin/dashboard`,
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F7F5] px-6">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center">
          <Link href="/" className="text-xl font-bold tracking-tighter text-[#1A2332]">
            SLATECAMP <span className="text-[#8896A7]">ADMIN</span>
          </Link>
          <h1 className="mt-6 text-xl font-semibold text-[#1A2332]">Staff Portal</h1>
          <p className="mt-2 text-sm text-[#4A5568]">Authorized personnel only.</p>
        </div>

        <div className="rounded-md border border-[#D4DAE3] bg-white p-8 shadow-sm">
          <SignInWithGoogleButton
            onClick={handleAdminLogin}
            disabled={loading}
            isLoading={loading}
          />
          {error && <p className="mt-4 text-center text-xs text-[#D64545]">{error}</p>}
        </div>

        <Eyebrow className="block text-center">Secure Environment</Eyebrow>
      </div>
    </div>
  );
}
