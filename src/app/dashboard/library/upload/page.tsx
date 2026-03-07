"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const router = useRouter();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
    }
  }, []);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: storageError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (storageError) {
      setUploading(false);
      return;
    }

    await supabase.from("documents").insert({
      user_id: user.id,
      filename: file.name,
      file_path: filePath,
      file_size_bytes: file.size,
      status: "processing",
    });

    // Trigger processing via API
    await fetch("/api/pdf/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath, userId: user.id }),
    });

    setUploaded(true);
    setUploading(false);
  }

  if (uploaded) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-signal-green)]/10">
          <CheckCircle2
            className="h-8 w-8 text-[var(--color-signal-green)]"
            strokeWidth={1.5}
          />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-foreground">
          Upload complete
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your PDF is being processed. Questions will be generated shortly.
        </p>
        <Button className="mt-6" onClick={() => router.push("/dashboard/library")}>
          Back to Library
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Upload PDF</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload your study materials. Cerebro will extract content and generate
          quiz questions.
        </p>
      </div>

      <Card
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`cursor-pointer border-2 border-dashed transition-all ${
          dragOver
            ? "border-[var(--color-signal-amber)] bg-[var(--color-signal-amber)]/5"
            : "border-border"
        }`}
      >
        <CardContent className="flex flex-col items-center py-12">
          {file ? (
            <>
              <FileText
                className="h-10 w-10 text-[var(--color-signal-amber)]"
                strokeWidth={1.5}
              />
              <p className="mt-3 text-sm font-medium text-foreground">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
              <p className="mt-3 text-sm text-muted-foreground">
                Drag and drop a PDF, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum 50MB per file
              </p>
            </>
          )}
          <input
            type="file"
            accept=".pdf"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) setFile(selected);
            }}
          />
        </CardContent>
      </Card>

      <Button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full"
      >
        {uploading ? "Uploading..." : "Upload & Process"}
      </Button>
    </div>
  );
}
