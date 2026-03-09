import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ROUTES, FALLBACK_SUBJECT_COLOR } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { SetBreadcrumbs } from "@/components/shared/SetBreadcrumbs";
import { NoExamProfilePrompt } from "@/components/shared/NoExamProfilePrompt";
import type { ExamProfile, Subject } from "@/types/app";

export const metadata = { title: "Library" };

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);

  const { data: examProfile } = await supabase
    .from("exam_profiles")
    .select("id, board_exam_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!examProfile) {
    return (
      <NoExamProfilePrompt
        title="Library"
        description="Browse questions by subject and question bank. Choose an exam to get started."
      />
    );
  }

  const ep = examProfile as ExamProfile;

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("board_exam_id", ep.board_exam_id)
    .order("sort_order");

  const subjectList = (subjects ?? []) as Subject[];

  if (subjectList.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse questions by subject and question bank.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          No subjects for your exam yet. Check back later.
        </p>
      </div>
    );
  }

  const { data: countRows } = await supabase
    .from("questions")
    .select("subject_id")
    .in("subject_id", subjectList.map((s) => s.id))
    .eq("status", "published");

  const countBySubject = new Map<string, number>();
  for (const row of countRows ?? []) {
    const sid = (row as { subject_id: string }).subject_id;
    countBySubject.set(sid, (countBySubject.get(sid) ?? 0) + 1);
  }

  return (
    <div className="space-y-8">
      <SetBreadcrumbs items={[{ href: "/dashboard/library", label: "Library" }]} />
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse questions by subject and question bank.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjectList.map((subject) => {
          const color = subject.color ?? FALLBACK_SUBJECT_COLOR;
          const qCount = countBySubject.get(subject.id) ?? 0;
          return (
            <Link key={subject.id} href={`/dashboard/library/subject/${subject.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <BookOpen className="h-6 w-6" style={{ color }} strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">
                      {subject.short_name ?? subject.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {qCount} question{qCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
