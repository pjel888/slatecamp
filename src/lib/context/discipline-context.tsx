"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Discipline } from "@/types/app";

interface DisciplineContextValue {
  activeDiscipline: Discipline | null;
  allDisciplines: Discipline[];
  switchDiscipline: (disciplineId: string) => Promise<void>;
  refreshActiveDiscipline: () => Promise<void>;
}

const DisciplineContext = createContext<DisciplineContextValue>({
  activeDiscipline: null,
  allDisciplines: [],
  switchDiscipline: async () => {},
  refreshActiveDiscipline: async () => {},
});

export function useDiscipline() {
  return useContext(DisciplineContext);
}

interface DisciplineProviderProps {
  children: React.ReactNode;
  initialDiscipline: Discipline | null;
  initialDisciplines: Discipline[];
}

export function DisciplineProvider({
  children,
  initialDiscipline,
  initialDisciplines,
}: DisciplineProviderProps) {
  const [activeDiscipline, setActiveDiscipline] = useState<Discipline | null>(initialDiscipline);
  const [allDisciplines, setAllDisciplines] = useState<Discipline[]>(initialDisciplines);
  const router = useRouter();

  const refreshActiveDiscipline = useCallback(async () => {
    const supabase = createClient();
    const { data: stats } = await supabase
      .from("user_global_stats")
      .select("disciplines(*)")
      .single();

    if (stats?.disciplines) {
      setActiveDiscipline(stats.disciplines as unknown as Discipline);
    }
  }, []);

  const switchDiscipline = useCallback(async (disciplineId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("user_global_stats")
      .update({ current_discipline_id: disciplineId })
      .eq('user_id', user.id);

    await refreshActiveDiscipline();
    router.refresh();
  }, [refreshActiveDiscipline, router]);

  return (
    <DisciplineContext.Provider value={{ activeDiscipline, allDisciplines, switchDiscipline, refreshActiveDiscipline }}>
      {children}
    </DisciplineContext.Provider>
  );
}
