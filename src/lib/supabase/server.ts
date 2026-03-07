import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isDemoMode } from "@/lib/demo/config";
import { createMockSupabaseClient } from "@/lib/demo/mock-supabase";

export async function createClient() {
  if (isDemoMode()) {
    await cookies();
    return createMockSupabaseClient() as unknown as ReturnType<typeof createServerClient>;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from Server Component — safe to ignore
          }
        },
      },
    }
  );
}
