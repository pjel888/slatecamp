"use client";

import { createContext, useContext, useState, useCallback } from "react";

export type ActiveSessionMode = "review" | "quiz" | null;

interface ActiveSessionContextValue {
  /** Only set when the user is actively in a question flow (review feed or quiz session). */
  activeSession: ActiveSessionMode;
  setActiveSession: (mode: ActiveSessionMode) => void;
}

const ActiveSessionContext = createContext<ActiveSessionContextValue>({
  activeSession: null,
  setActiveSession: () => {},
});

export function useActiveSession() {
  return useContext(ActiveSessionContext);
}

interface ActiveSessionProviderProps {
  children: React.ReactNode;
}

export function ActiveSessionProvider({ children }: ActiveSessionProviderProps) {
  const [activeSession, setActiveSessionState] = useState<ActiveSessionMode>(null);
  const setActiveSession = useCallback((mode: ActiveSessionMode) => {
    setActiveSessionState(mode);
  }, []);

  return (
    <ActiveSessionContext.Provider value={{ activeSession, setActiveSession }}>
      {children}
    </ActiveSessionContext.Provider>
  );
}
