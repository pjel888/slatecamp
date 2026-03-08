import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SetBreadcrumbs } from "@/components/shared/SetBreadcrumbs";
import type { Subject, QuestionBank } from "@/types/app";

type Props = { params: Promise<{ subjectId: string }> };

export async function generateMetadata({ params }: Props) {
  const { subjectId } = await params;
  const supabase = await createClient();
  const { data: subject } = await supabase
    .from("subjects")
    .select("name, short_name")
    .eq("id", subjectId)
    .single();
  const name = subject ? ((subject as Subject).short_name ?? (subject as Subject).name) : "Subject";
  return { title: `${name} — Library` };
}

export default async function LibrarySubjectPage({ params }: Props) {
  const { subjectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: subject } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", subjectId)
    .single();

  if (!subject) notFound();

  const sub = subject as Subject;

  const { data: questionRows } = await supabase
    .from("questions")
    .select("bank_id")
    .eq("subject_id", subjectId)
    .eq("status", "published")
    .not("bank_id", "is", null);

  const bankToCount = new Map<string, number>();
  const bankIds = new Set<string>();
  for (const row of questionRows ?? []) {
    const bank_id = (row as { bank_id: string }).bank_id;
    if (!bank_id) continue;
    bankToCount.set(bank_id, (bankToCount.get(bank_id) ?? 0) + 1);
    bankIds.add(bank_id);
  }

  const { data: banks } =
    bankIds.size > 0
      ? await supabase
          .from("question_banks")
          .select("*")
          .in("id", Array.from(bankIds))
          .or(`creator_id.eq.${user.id},is_official.eq.true`)
      : { data: [] };

  const bankList = (banks ?? []) as QuestionBank[];
  const entries = bankList
    .map((b) => ({ bank: b, count: bankToCount.get(b.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);

  const color = sub.color ?? "#86868B";
  const subjectName = sub.short_name ?? sub.name;

  return (
    <div className="space-y-6">
      <SetBreadcrumbs
        items={[
          { href: "/dashboard/library", label: "Library" },
          { href: `/dashboard/library/subject/${subjectId}`, label: subjectName },
        ]}
      />
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}15` }}
        >
          <BookOpen className="h-6 w-6" style={{ color }} strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {sub.short_name ?? sub.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {entries.reduce((s, e) => s + e.count, 0)} questions in {entries.length} bank
            {entries.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No question banks with published questions in this subject yet.
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map(({ bank, count }) => (
            <Link key={bank.id} href={`/dashboard/library/bank/${bank.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="font-medium text-foreground">{bank.title}</span>
                    {bank.is_official && (
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        Official
                      </Badge>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {count} question{count !== 1 ? "s" : ""}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
