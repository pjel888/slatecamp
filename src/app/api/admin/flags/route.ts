import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { isDemoMode } from "@/lib/demo/config";
import { isAdmin } from "@/lib/admin/is-admin";
import { featureFlagsSchema } from "@/lib/validations";

const COOKIE_NAME = "cerebro_dev_flags";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const flags = featureFlagsSchema.parse(body);
    const cookieStore = await cookies();

    if (!isDemoMode()) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const admin = await isAdmin();
      if (!admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Secure cookie settings: httpOnly=true prevents XSS access
    cookieStore.set(COOKIE_NAME, JSON.stringify(flags), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);

  return NextResponse.json({ success: true });
}
