"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { BoardExam, ExamProfile, Subject } from "@/types/app";

interface ExamProfileContextValue {
  activeProfile: ExamProfile | null;
  profiles: ExamProfile[];
  boardExams: BoardExam[];
  subjects: Subject[];
  switchProfile: (profileId: string) => Promise<void>;
  refreshProfiles: () => Promise<void>;
}

const ExamProfileContext = createContext<ExamProfileContextValue>({
  activeProfile: null,
  profiles: [],
  boardExams: [],
  subjects: [],
  switchProfile: async () => {},
  refreshProfiles: async () => {},
});

export function useExamProfile() {
  return useContext(ExamProfileContext);
}

interface ExamProfileProviderProps {
  children: React.ReactNode;
  initialProfile: ExamProfile | null;
  initialProfiles: ExamProfile[];
  initialBoardExams?: BoardExam[];
  initialSubjects: Subject[];
}

export function ExamProfileProvider({
  children,
  initialProfile,
  initialProfiles,
  initialBoardExams = [],
  initialSubjects,
}: ExamProfileProviderProps) {
  const [activeProfile, setActiveProfile] = useState<ExamProfile | null>(initialProfile);
  const [profiles, setProfiles] = useState<ExamProfile[]>(initialProfiles);
  const [boardExams] = useState<BoardExam[]>(initialBoardExams);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const router = useRouter();

  const refreshProfiles = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("exam_profiles")
      .select("*, board_exams(*)")
      .order("created_at", { ascending: true });

    if (data) {
      setProfiles(data as ExamProfile[]);
      const active = data.find((p: ExamProfile) => p.is_active) ?? data[0] ?? null;
      setActiveProfile(active as ExamProfile | null);

      if (active) {
        const { data: subs } = await supabase
          .from("subjects")
          .select("*")
          .eq("board_exam_id", active.board_exam_id)
          .order("sort_order");
        if (subs) setSubjects(subs as Subject[]);
      }
    }
  }, []);

  const switchProfile = useCallback(async (profileId: string) => {
    const supabase = createClient();

    await supabase
      .from("exam_profiles")
      .update({ is_active: false })
      .neq("id", profileId);

    await supabase
      .from("exam_profiles")
      .update({ is_active: true })
      .eq("id", profileId);

    await refreshProfiles();
    router.refresh();
  }, [refreshProfiles, router]);

  return (
    <ExamProfileContext.Provider value={{ activeProfile, profiles, boardExams, subjects, switchProfile, refreshProfiles }}>
      {children}
    </ExamProfileContext.Provider>
  );
}
