import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { SetBreadcrumbs } from "@/components/shared/SetBreadcrumbs";
import type { Question, QuestionBank, Subject, Choice } from "@/types/app";

type Props = { params: Promise<{ bankId: string }> };

export async function generateMetadata({ params }: Props) {
  const { bankId } = await params;
  const supabase = await createClient();
  const { data: bank } = await supabase
    .from("question_banks")
    .select("title")
    .eq("id", bankId)
    .single();
  return { title: bank?.title ? `${bank.title} — Library` : "Library" };
}

export default async function LibraryBankPage({ params }: Props) {
  const { bankId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bank } = await supabase
    .from("question_banks")
    .select("*")
    .eq("id", bankId)
    .single();

  if (!bank) notFound();

  const b = bank as QuestionBank;

  const { data: questions } = await supabase
    .from("questions")
    .select("id, prompt, prompt_image_url, choices, correct_answer, explanation")
    .eq("bank_id", bankId)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  const { data: qWithSubject } = await supabase
    .from("questions")
    .select("id, subject_id")
    .eq("bank_id", bankId)
    .eq("status", "published")
    .limit(1)
    .single();

  let subjectId: string | null = null;
  let subjectName: string | null = null;
  if (qWithSubject?.subject_id) {
    subjectId = (qWithSubject as { subject_id: string }).subject_id;
    const { data: subRow } = await supabase
      .from("subjects")
      .select("name, short_name")
      .eq("id", subjectId)
      .single();
    if (subRow) subjectName = (subRow as Subject).short_name ?? (subRow as Subject).name;
  }

  const questionList = (questions ?? []) as Pick<
    Question,
    "id" | "prompt" | "prompt_image_url" | "choices" | "correct_answer" | "explanation"
  >[];

  const breadcrumbItems = [
    { href: "/dashboard/library", label: "Library" },
    ...(subjectId && subjectName
      ? [{ href: `/dashboard/library/subject/${subjectId}`, label: subjectName }]
      : []),
    { href: `/dashboard/library/bank/${bankId}`, label: b.title },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SetBreadcrumbs items={breadcrumbItems} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{b.title}</h1>
          {b.description && (
            <p className="mt-1 text-sm text-muted-foreground">{b.description}</p>
          )}
        </div>
        {b.is_official && (
          <Badge variant="secondary" className="shrink-0">
            Official
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {questionList.length} question{questionList.length !== 1 ? "s" : ""} — answers shown below.
      </p>

      <div className="space-y-8">
        {questionList.map((q, index) => {
          const choices = (q.choices as Choice[] | null) ?? [];
          const correctIds = q.correct_answer.split(",").map((s) => s.trim());
          return (
            <Card key={q.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Question {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {q.prompt_image_url && (
                  <img
                    src={q.prompt_image_url}
                    alt="Question"
                    className="rounded-lg border border-border/60 object-contain max-h-48 w-full"
                  />
                )}
                <p className="text-[15px] leading-relaxed text-foreground">{q.prompt}</p>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Choices
                  </p>
                  <ul className="space-y-2">
                    {choices.map((choice) => {
                      const isCorrect = correctIds.includes(choice.id);
                      return (
                        <li
                          key={choice.id}
                          className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                            isCorrect
                              ? "border-color-signal-green bg-color-signal-green/5"
                              : "border-border/60 bg-muted/20"
                          }`}
                        >
                          {isCorrect && (
                            <CheckCircle2
                              className="h-4 w-4 shrink-0 text-color-signal-green"
                              strokeWidth={1.5}
                            />
                          )}
                          <span
                            className={`text-sm ${isCorrect ? "font-medium text-foreground" : "text-muted-foreground"}`}
                          >
                            {choice.text}
                          </span>
                          {isCorrect && (
                            <span className="ml-auto shrink-0 text-[10px] font-medium text-color-signal-green">
                              Correct
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {q.explanation && (
                  <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Explanation
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-foreground">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
