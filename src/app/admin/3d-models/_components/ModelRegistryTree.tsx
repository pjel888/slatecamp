'use client'

import { useState } from 'react'
import type { RegistryTree } from '../_lib/model-registry-data'

interface ModelRegistryTreeProps {
  tree: RegistryTree
  selectedId: string | null
  onSelect: (modelId: string) => void
}

export function ModelRegistryTree({ tree, selectedId, onSelect }: ModelRegistryTreeProps) {
  // Default: first subject expanded, all others collapsed
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    () => new Set(tree.subjects.length > 0 ? [tree.subjects[0].label] : [])
  )
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  function toggleSubject(label: string) {
    setExpandedSubjects((prev) => {
      const next = new Set(prev)
      if (next.has(label)) {
        next.delete(label)
      } else {
        next.add(label)
      }
      return next
    })
  }

  function toggleCategory(key: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <div>
      {tree.subjects.map((subject) => {
        const isSubjectExpanded = expandedSubjects.has(subject.label)
        return (
          <div key={subject.label}>
            <button
              onClick={() => toggleSubject(subject.label)}
              data-expanded={isSubjectExpanded}
            >
              {isSubjectExpanded ? '▼' : '▶'} {subject.label} ({subject.totalModules})
            </button>
            {isSubjectExpanded && (
              <div>
                {subject.categories.map((cat) => {
                  const isCatExpanded = expandedCategories.has(cat.key)
                  return (
                    <div key={cat.key}>
                      <button
                        onClick={() => toggleCategory(cat.key)}
                        data-expanded={isCatExpanded}
                      >
                        {isCatExpanded ? '▼' : '▶'} {cat.label} ({cat.moduleCount})
                      </button>
                      {isCatExpanded && (
                        <div>
                          {cat.modules.map((mod) => (
                            <button
                              key={mod.id}
                              onClick={() => onSelect(mod.id)}
                              data-selected={mod.id === selectedId}
                            >
                              {mod.title} [{mod.templateType}]
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
