import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart } from "lucide-react";
import type { QuestionBank } from "@/types/app";

export const metadata = { title: "Marketplace" };

export default async function MarketplacePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: banks } = await supabase
    .from("question_banks")
    .select("*")
    .eq("status", "published")
    .eq("is_marketplace", true)
    .order("total_purchases", { ascending: false });

  const { data: purchases } = await supabase
    .from("marketplace_purchases")
    .select("bank_id")
    .eq("buyer_id", user.id);

  const purchasedIds = new Set((purchases ?? []).map((p: { bank_id: string }) => p.bank_id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Marketplace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse and purchase premium question banks from expert reviewers.
        </p>
      </div>

      {(banks as QuestionBank[] | null)?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(banks as QuestionBank[]).map((bank) => {
            const owned = purchasedIds.has(bank.id);
            return (
              <Card key={bank.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium">
                      {bank.title}
                    </CardTitle>
                    {bank.average_rating > 0 && (
                      <span className="flex items-center gap-1 text-xs text-[var(--color-result-gold)]">
                        <Star className="h-3 w-3 fill-current" />
                        {bank.average_rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {bank.description ?? "No description"}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {bank.question_count} questions
                    </span>
                    {owned ? (
                      <Badge>Owned</Badge>
                    ) : (
                      <Button size="sm">
                        <ShoppingCart className="mr-1 h-3 w-3" />₱
                        {(bank.price_cents / 100).toFixed(0)}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No marketplace items available yet. Check back soon!
        </p>
      )}
    </div>
  );
}
