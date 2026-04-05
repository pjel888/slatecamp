'use client'

import * as React from 'react'

interface DisciplineData {
  disciplineId: string | null
  disciplineName: string
}

const WikiDisciplineContext = React.createContext<DisciplineData>({
  disciplineId: null,
  disciplineName: 'Syllabus',
})

export function WikiDisciplineProvider({
  disciplineId,
  disciplineName,
  children,
}: DisciplineData & { children: React.ReactNode }) {
  return (
    <WikiDisciplineContext.Provider value={{ disciplineId, disciplineName }}>
      {children}
    </WikiDisciplineContext.Provider>
  )
}

export function useWikiDiscipline() {
  return React.useContext(WikiDisciplineContext)
}
