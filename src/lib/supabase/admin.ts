import { createClient } from "@supabase/supabase-js";
import { isDemoMode } from "@/lib/demo/config";
import { createMockSupabaseClient } from "@/lib/demo/mock-supabase";

export function createAdminClient() {
  if (isDemoMode()) {
    return createMockSupabaseClient() as unknown as ReturnType<typeof createClient>;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
