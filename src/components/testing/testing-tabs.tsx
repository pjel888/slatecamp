"use client";

import { useState, useCallback } from "react";
import { Brain, ClipboardList, BookOpen, Library } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QuizTab } from "./quiz-tab";
import { SessionsTab } from "./sessions-tab";
import { ReviewTab } from "./review-tab";
import { LibraryTab } from "./library-tab";
import type { ExamProfile, Subject, ReviewSession, SubjectMastery } from "@/types/app";

const TAB_KEYS = ["quiz", "sessions", "review", "library"] as const;
type TabKey = (typeof TAB_KEYS)[number];

interface TestingTabsProps {
  examProfile: ExamProfile;
  subjects: Subject[];
  sessions: ReviewSession[];
  masteries: SubjectMastery[];
  questionCounts: Record<string, number>;
  initialTab?: string;
  initialQuickSubjectId?: string;
}

export function TestingTabs({
  examProfile,
  subjects,
  sessions,
  masteries,
  questionCounts,
  initialTab,
  initialQuickSubjectId,
}: TestingTabsProps) {
  const resolvedInitial: TabKey =
    TAB_KEYS.includes(initialTab as TabKey) ? (initialTab as TabKey) : "quiz";

  const [activeTab, setActiveTab] = useState<TabKey>(resolvedInitial);

  const handleTabChange = useCallback((value: string | number | null) => {
    if (value && TAB_KEYS.includes(value as TabKey)) {
      const tab = value as TabKey;
      setActiveTab(tab);
      // Update URL without triggering server navigation
      const params = new URLSearchParams(window.location.search);
      params.set("tab", tab);
      // Remove quick-start params when switching away from quiz
      if (tab !== "quiz") {
        params.delete("subject");
        params.delete("quick");
      }
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    }
  }, []);

  const handleQuickStartFromReview = useCallback((subjectId: string) => {
    setActiveTab("quiz");
    // Update URL to reflect the quick start state
    const params = new URLSearchParams();
    params.set("tab", "quiz");
    params.set("subject", subjectId);
    params.set("quick", "true");
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, []);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList
        variant="line"
        className="w-full justify-start gap-0 border-b border-border/40 px-0"
      >
        <TabsTrigger value="quiz" className="gap-1.5 px-4 py-2.5 text-[13px]">
          <Brain className="h-3.5 w-3.5" strokeWidth={1.5} />
          Take a Quiz
        </TabsTrigger>
        <TabsTrigger value="sessions" className="gap-1.5 px-4 py-2.5 text-[13px]">
          <ClipboardList className="h-3.5 w-3.5" strokeWidth={1.5} />
          My Sessions
        </TabsTrigger>
        <TabsTrigger value="review" className="gap-1.5 px-4 py-2.5 text-[13px]">
          <BookOpen className="h-3.5 w-3.5" strokeWidth={1.5} />
          Review
        </TabsTrigger>
        <TabsTrigger value="library" className="gap-1.5 px-4 py-2.5 text-[13px]">
          <Library className="h-3.5 w-3.5" strokeWidth={1.5} />
          Question Library
        </TabsTrigger>
      </TabsList>

      <TabsContent value="quiz" className="pt-6">
        <QuizTab
          examProfileId={examProfile.id}
          subjects={subjects}
          initialQuickSubjectId={
            activeTab === "quiz" ? initialQuickSubjectId : undefined
          }
        />
      </TabsContent>

      <TabsContent value="sessions" className="pt-6">
        <SessionsTab sessions={sessions} />
      </TabsContent>

      <TabsContent value="review" className="pt-6">
        <ReviewTab
          examProfileId={examProfile.id}
          subjects={subjects}
          masteries={masteries}
          questionCounts={questionCounts}
          onQuickStart={handleQuickStartFromReview}
        />
      </TabsContent>

      <TabsContent value="library" className="pt-6">
        <LibraryTab subjects={subjects} questionCounts={questionCounts} />
      </TabsContent>
    </Tabs>
  );
}
