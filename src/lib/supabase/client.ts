"use client";

import { createBrowserClient } from "@supabase/ssr";
import { createMockSupabaseClient } from "@/lib/demo/mock-supabase";
import { isDemoMode } from "@/lib/demo/config";

export function createClient() {
  // Demo mode is a separate, explicit feature for the "/try" experience.
  if (isDemoMode()) {
    return createMockSupabaseClient() as ReturnType<typeof createBrowserClient>;
  }

  // Real Supabase browser client. 
  // In dev mode with DEV_FORCE_USER_ID, the server renders the real data.
  // The client will use its normal session if one exists.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
