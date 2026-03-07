import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import { isDemoMode } from "@/lib/demo/config";

export async function POST(request: Request) {
  if (isDemoMode()) {
    const embedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
    return NextResponse.json({ embedding });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text } = await request.json();

  try {
    const ai = getAIProvider();
    const embedding = await ai.generateEmbedding(text);
    return NextResponse.json({ embedding });
  } catch {
    return NextResponse.json(
      { error: "Embedding generation failed" },
      { status: 500 }
    );
  }
}
