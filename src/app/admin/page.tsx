"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SignInWithGoogleButton } from "@/components/auth/SignInWithGoogleButton";
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center">
          <Link href="/" className="text-xl font-bold tracking-tighter text-zinc-900">
            SLATECAMP <span className="text-zinc-400">ADMIN</span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold text-zinc-900">Staff Portal</h1>
          <p className="mt-2 text-sm text-zinc-500">Authorized personnel only.</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <SignInWithGoogleButton
            onClick={handleAdminLogin}
            disabled={loading}
            isLoading={loading}
          />
          {error && <p className="mt-4 text-center text-xs text-red-600">{error}</p>}
        </div>
        
        <p className="text-center text-[10px] text-zinc-400 uppercase tracking-widest">
          Secure Environment
        </p>
      </div>
    </div>
  );
}
