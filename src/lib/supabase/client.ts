"use client";

import { createBrowserClient } from "@supabase/ssr";
import { createMockSupabaseClient } from "@/lib/demo/mock-supabase";

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return createMockSupabaseClient() as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
