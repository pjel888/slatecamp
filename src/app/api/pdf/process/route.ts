import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAIProvider } from "@/lib/ai/provider";
import { isDemoMode } from "@/lib/demo/config";

export async function POST(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ success: true, chunks: 12 });
  }

  const { filePath, userId } = await request.json();

  if (!filePath || !userId) {
    return NextResponse.json(
      { error: "Missing filePath or userId" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  try {
    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(filePath);

    if (downloadError || !fileData) {
      throw new Error("Failed to download file");
    }

    // Extract text from PDF
    const arrayBuffer = await fileData.arrayBuffer();
    const textContent = await extractTextFromPDF(arrayBuffer);

    if (!textContent) {
      await supabase
        .from("documents")
        .update({ status: "error" })
        .eq("file_path", filePath)
        .eq("user_id", userId);
      return NextResponse.json({ error: "No text extracted" }, { status: 400 });
    }

    // Chunk the text (500 tokens ~= 2000 chars, 50 token overlap ~= 200 chars)
    const chunks = chunkText(textContent, 2000, 200);

    // Generate embeddings and store chunks
    const ai = getAIProvider();
    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedding = await ai.generateEmbedding(chunks[i]);

        const { data: doc } = await supabase
          .from("documents")
          .select("id")
          .eq("file_path", filePath)
          .eq("user_id", userId)
          .single();

        if (doc) {
          await supabase.from("document_chunks").insert({
            document_id: doc.id,
            chunk_index: i,
            content: chunks[i],
            embedding,
            page_number: Math.floor(i / 3) + 1,
          });
        }
      } catch {
        console.error(`Failed to process chunk ${i}`);
      }
    }

    // Mark document as ready
    await supabase
      .from("documents")
      .update({
        status: "ready",
        page_count: Math.ceil(chunks.length / 3),
      })
      .eq("file_path", filePath)
      .eq("user_id", userId);

    return NextResponse.json({ success: true, chunks: chunks.length });
  } catch (error) {
    await supabase
      .from("documents")
      .update({ status: "error" })
      .eq("file_path", filePath)
      .eq("user_id", userId);

    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = typeof pdfParseModule === "function" ? pdfParseModule : (pdfParseModule as Record<string, unknown>).default as (buf: Buffer) => Promise<{ text: string }>;
    const result = await pdfParse(Buffer.from(buffer));
    return result.text;
  } catch {
    return "";
  }
}

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;

    if (start >= text.length) break;
  }

  return chunks.filter((c) => c.trim().length > 50);
}
