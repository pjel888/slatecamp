"use client";

import { createBrowserClient } from "@supabase/ssr";
import { createMockSupabaseClient } from "@/lib/demo/mock-supabase";
import { isDemoMode } from "@/lib/demo/config";

export function createClient() {
  if (isDemoMode()) {
    return createMockSupabaseClient() as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
