import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Upload, ShoppingBag, Star } from "lucide-react";
import type { QuestionBank } from "@/types/app";

export const metadata = { title: "Library" };

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: myBanks } = await supabase
    .from("question_banks")
    .select("*")
    .or(`creator_id.eq.${user.id},is_official.eq.true`)
    .order("updated_at", { ascending: false });

  const { data: purchasedBankIds } = await supabase
    .from("marketplace_purchases")
    .select("bank_id")
    .eq("buyer_id", user.id);

  const purchasedIds = new Set(
    (purchasedBankIds ?? []).map((p: { bank_id: string }) => p.bank_id)
  );

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your question banks, uploads, and marketplace.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/library/upload">
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Upload PDF
            </Button>
          </Link>
          <Link href="/dashboard/library/marketplace">
            <Button variant="outline" size="sm">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Marketplace
            </Button>
          </Link>
        </div>
      </div>

      {/* Question Banks */}
      <div>
        <h2 className="mb-4 text-base font-medium text-foreground">
          Question Banks
        </h2>
        {(myBanks as QuestionBank[] | null)?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(myBanks as QuestionBank[]).map((bank) => (
              <Card key={bank.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium">
                      {bank.title}
                    </CardTitle>
                    {bank.is_official && (
                      <Badge variant="secondary" className="text-[10px]">
                        Official
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {bank.description ?? "No description"}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {bank.question_count} questions
                    </span>
                    {bank.average_rating > 0 && (
                      <span className="flex items-center gap-1 text-xs text-[var(--color-result-gold)]">
                        <Star className="h-3 w-3 fill-current" />
                        {bank.average_rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No question banks yet. Upload a PDF or browse the marketplace.
          </p>
        )}
      </div>

      {/* Recent Uploads */}
      <div>
        <h2 className="mb-4 text-base font-medium text-foreground">
          Recent Uploads
        </h2>
        {documents?.length ? (
          <div className="space-y-2">
            {documents.map((doc: { id: string; filename: string; page_count: number | null; created_at: string; status: string }) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-md border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {doc.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {doc.page_count ? `${doc.page_count} pages` : ""} &middot;{" "}
                    {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={doc.status === "ready" ? "default" : "secondary"}
                  className="text-[10px] capitalize"
                >
                  {doc.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No documents uploaded yet.
          </p>
        )}
      </div>
    </div>
  );
}
