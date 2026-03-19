# SlateCamp — 3D Lab Implementation Plan
## Schema + Framework + First 3 Modules + Full System Integration

---

## SOURCE DOCUMENTS

- **3D Visual Learning UX Research Brief** — 10 UX principles, 6 research foundations, module-level interaction specs
- **3D Integration Analysis** — Product architecture alignment, 4 schema additions, 9 new requirements, anti-pattern checklist
- **Product Architecture v2.1** — Existing 3D Lab spec (Section 4.5), React Three Fiber stack, `models_3d` + `spatial_hotspots` tables
- **DB Audit v3** — Confirms: `models_3d` 0 rows, `spatial_hotspots` 0 rows, `supported_modes TEXT[]` already on `models_3d`

**This prompt has 4 phases:** Schema → Framework → First Module → Integration. Each phase is self-contained.

---

## ROLE

You are a Senior React/Three.js Engineer building an interactive 3D learning lab for architecture licensure exam prep. You use React Three Fiber + @react-three/drei + Zustand for 3D state. You follow SlateCamp's design system (Cobalt `#1B3FC4`, Signal Red `#E63329`, Signal Green `#1B7A3C`, Inter body, DM Mono labels). All data writes go through Server Actions. The 3D Lab writes to `user_interactions` — it's a first-class part of the mastery engine, not a sidecar.

---

## PHASE 1: Schema Additions (4 ALTER TABLE Statements)

### Pre-flight

```sql
-- Check which columns already exist
SELECT table_name, column_name FROM information_schema.columns
WHERE (table_name = 'models_3d' AND column_name IN ('context_scenario', 'ale_question_count', 'ale_question_type', 'supported_phases', 'has_challenge_mode', 'supported_modes'))
   OR (table_name = 'spatial_hotspots' AND column_name IN ('phase', 'question_id', 'reveal_order'))
   OR (table_name = 'trail_steps' AND column_name IN ('lab_phase'))
   OR (table_name = 'user_interactions' AND column_name IN ('source_type'))
ORDER BY table_name, column_name;
```

### Migration

```sql
-- ============================================================
-- 3D Lab Schema: Research-Driven Additions
-- Source: Integration Analysis Part 4
-- ============================================================

-- 4.1 models_3d — Context Scenario and Exam Metadata
ALTER TABLE public.models_3d
  ADD COLUMN IF NOT EXISTS context_scenario TEXT,
  ADD COLUMN IF NOT EXISTS ale_question_count INTEGER,
  ADD COLUMN IF NOT EXISTS ale_question_type TEXT,
  ADD COLUMN IF NOT EXISTS supported_phases TEXT[] DEFAULT '{guided}',
  ADD COLUMN IF NOT EXISTS has_challenge_mode BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.models_3d.context_scenario IS
  '2-sentence professional scenario shown at module open. Required for every module.';
COMMENT ON COLUMN public.models_3d.ale_question_count IS
  'Estimated ALE questions per sitting covered by this module.';
COMMENT ON COLUMN public.models_3d.supported_phases IS
  'Which learning phases are built: guided, faded, sandbox, challenge.';

-- 4.2 spatial_hotspots — Phase and Interaction Type
ALTER TABLE public.spatial_hotspots
  ADD COLUMN IF NOT EXISTS phase TEXT DEFAULT 'guided'
    CHECK (phase IN ('guided', 'faded', 'sandbox', 'challenge')),
  ADD COLUMN IF NOT EXISTS question_id UUID REFERENCES public.questions(question_id),
  ADD COLUMN IF NOT EXISTS reveal_order INTEGER DEFAULT 1;

COMMENT ON COLUMN public.spatial_hotspots.question_id IS
  'Links hotspot to question bank. In-canvas quiz answers write to user_interactions via this FK.';
COMMENT ON COLUMN public.spatial_hotspots.reveal_order IS
  'Sequence in guided tour. Focus Mode reveals hotspots one at a time in this order.';

-- 4.3 trail_steps — 3D Phase Prescription
ALTER TABLE public.trail_steps
  ADD COLUMN IF NOT EXISTS lab_phase TEXT DEFAULT 'guided'
    CHECK (lab_phase IN ('guided', 'faded', 'sandbox', 'challenge'));

COMMENT ON COLUMN public.trail_steps.lab_phase IS
  'Which 3D Lab phase the trail prescribes. Day 1: guided. Day 8: faded. Day 14: sandbox.';

-- 4.4 user_interactions — Source Type for Weight Differentiation
ALTER TABLE public.user_interactions
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'quiz'
    CHECK (source_type IN ('quiz', '3d_lab', 'assessment', 'blindspot'));

COMMENT ON COLUMN public.user_interactions.source_type IS
  'Enables EMA weight differentiation. 3D Lab interactions may receive bonus weight for spatial mastery.';
```

**Verify:**
```sql
SELECT table_name, column_name FROM information_schema.columns
WHERE (table_name = 'models_3d' AND column_name IN ('context_scenario', 'ale_question_count', 'supported_phases'))
   OR (table_name = 'spatial_hotspots' AND column_name IN ('phase', 'question_id', 'reveal_order'))
   OR (table_name = 'trail_steps' AND column_name = 'lab_phase')
   OR (table_name = 'user_interactions' AND column_name = 'source_type');
-- Should return 10 rows
```

**STOP.** "Phase 1 Complete. Schema ready. Reply 'Proceed.'"

---

## PHASE 2: 3D Lab Component Framework

### Codebase Audit First

```bash
# Check existing 3D-related code
find src/ -path "*3d*" -o -path "*lab*" -o -path "*three*" -o -path "*model*" | grep -v node_modules | sort

# Check if React Three Fiber is installed
cat package.json | grep -E "three|fiber|drei|zustand"

# Check existing component structure
find src/components -name "*.tsx" | sort | head -30

# Find existing 3D Lab page route
find src/app -path "*lab*" -o -path "*3d*" | sort
```

If React Three Fiber, drei, and zustand are NOT installed:
```bash
npm install three @react-three/fiber @react-three/drei zustand
npm install -D @types/three
```

### 2a. 3D Lab Zustand Store

Create: `src/stores/lab-store.ts`

```typescript
import { create } from 'zustand'

type LabPhase = 'guided' | 'faded' | 'sandbox' | 'challenge'

interface HotspotState {
  hotspotId: string
  revealed: boolean
  answered: boolean
  isCorrect: boolean | null
}

interface LabStore {
  // Phase management
  currentPhase: LabPhase
  setPhase: (phase: LabPhase) => void

  // Focus Mode (progressive disclosure)
  focusModeActive: boolean
  toggleFocusMode: () => void
  focusedHotspotIndex: number
  setFocusedHotspot: (index: number) => void
  advanceFocus: () => void

  // Hotspot state
  hotspots: HotspotState[]
  setHotspots: (hotspots: HotspotState[]) => void
  revealHotspot: (id: string) => void
  answerHotspot: (id: string, isCorrect: boolean) => void

  // Parametric sliders
  parameters: Record<string, number>
  setParameter: (key: string, value: number) => void

  // Compliance state
  violations: string[]
  isCompliant: boolean

  // Guided tour
  guidedTourStep: number
  guidedTourTotal: number
  advanceTour: () => void
  tourComplete: boolean

  // Session tracking
  questionsAnswered: number
  questionsCorrect: number
}

export const useLabStore = create<LabStore>((set, get) => ({
  currentPhase: 'guided',
  setPhase: (phase) => set({ currentPhase: phase }),

  focusModeActive: true, // Always starts ON per research spec
  toggleFocusMode: () => set(s => ({ focusModeActive: !s.focusModeActive })),
  focusedHotspotIndex: 0,
  setFocusedHotspot: (index) => set({ focusedHotspotIndex: index }),
  advanceFocus: () => set(s => ({
    focusedHotspotIndex: Math.min(s.focusedHotspotIndex + 1, s.hotspots.length - 1)
  })),

  hotspots: [],
  setHotspots: (hotspots) => set({ hotspots }),
  revealHotspot: (id) => set(s => ({
    hotspots: s.hotspots.map(h => h.hotspotId === id ? { ...h, revealed: true } : h)
  })),
  answerHotspot: (id, isCorrect) => set(s => ({
    hotspots: s.hotspots.map(h => h.hotspotId === id ? { ...h, answered: true, isCorrect } : h),
    questionsAnswered: s.questionsAnswered + 1,
    questionsCorrect: s.questionsCorrect + (isCorrect ? 1 : 0),
  })),

  parameters: {},
  setParameter: (key, value) => set(s => ({ parameters: { ...s.parameters, [key]: value } })),

  violations: [],
  isCompliant: true,

  guidedTourStep: 0,
  guidedTourTotal: 0,
  advanceTour: () => set(s => ({
    guidedTourStep: s.guidedTourStep + 1,
    tourComplete: s.guidedTourStep + 1 >= s.guidedTourTotal,
  })),
  tourComplete: false,

  questionsAnswered: 0,
  questionsCorrect: 0,
}))
```

### 2b. Core Layout Component — Dual-Coding Split Panel

Create: `src/components/lab/LabLayout.tsx`

```typescript
// Research spec: Desktop = model left, code right. Mobile = model top, code below.
// NEVER separate screens. NEVER modals that hide the model.

interface LabLayoutProps {
  modelPanel: React.ReactNode   // The R3F Canvas
  codePanel: React.ReactNode    // Code citations, hotspot info, sliders
  contextScenario?: string      // 2-sentence opening narrative
  moduleTitle: string
  aleQuestionCount?: number
}

export function LabLayout({ modelPanel, codePanel, contextScenario, moduleTitle, aleQuestionCount }: LabLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-[#111111]">
      {/* Context Scenario Banner */}
      {contextScenario && (
        <div className="px-6 py-3 bg-[#1A1A2E] border-b border-white/10">
          <p className="text-[13px] text-white/50 leading-relaxed max-w-[640px]">
            {contextScenario}
          </p>
        </div>
      )}

      {/* Module Header */}
      <div className="px-6 py-3 flex items-center justify-between border-b border-white/10">
        <div>
          <p className="font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.15em] text-white/30">
            3D Lab
          </p>
          <h1 className="font-[family-name:var(--font-syne)] font-bold text-[18px] text-white">
            {moduleTitle}
          </h1>
        </div>
        {aleQuestionCount && (
          <span className="font-[family-name:var(--font-dm-mono)] text-[10px] text-[#F5A623] bg-[#F5A623]/10 px-3 py-1 rounded-full">
            ~{aleQuestionCount} ALE questions per sitting
          </span>
        )}
      </div>

      {/* Split Panel — responsive */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Model Panel — 60% on desktop, full width stacked on mobile */}
        <div className="flex-1 lg:flex-[3] min-h-[300px] lg:min-h-0 relative">
          {modelPanel}
        </div>

        {/* Code Panel — 40% on desktop, below on mobile */}
        <div className="lg:flex-[2] lg:border-l border-t lg:border-t-0 border-white/10 bg-[#1A1A2E] overflow-y-auto max-h-[40vh] lg:max-h-none">
          {codePanel}
        </div>
      </div>
    </div>
  )
}
```

### 2c. Focus Mode Component

```typescript
// Research: "Highlight one dimension at a time. Grey out all others."
// Focus Mode is ALWAYS on during guided tour. Student can toggle off after tour.

interface FocusModeToggleProps {
  active: boolean
  onToggle: () => void
  tourComplete: boolean  // Only show toggle after guided tour
}

export function FocusModeToggle({ active, onToggle, tourComplete }: FocusModeToggleProps) {
  if (!tourComplete) return null // Hidden during guided tour — focus is forced on

  return (
    <button
      onClick={onToggle}
      className={`absolute top-4 right-4 z-10 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
        active
          ? 'bg-[#1B3FC4] text-white'
          : 'bg-white/10 text-white/60 hover:bg-white/15'
      }`}
    >
      {active ? 'Focus Mode' : 'Full View'}
    </button>
  )
}
```

### 2d. Hotspot Question Component (Testing-Effect Sequence)

```typescript
// Research: QUESTION FIRST, ANSWER SECOND. Never show the label first.
// Sequence: pulsate → tap → question → answer → code citation

interface HotspotQuestionProps {
  questionText: string
  options: { id: string; text: string }[]
  correctOptionId: string
  codeCitation: string
  onAnswer: (selectedId: string, isCorrect: boolean) => void
}

export function HotspotQuestion({ questionText, options, correctOptionId, codeCitation, onAnswer }: HotspotQuestionProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  const handleSelect = (optionId: string) => {
    if (revealed) return
    setSelected(optionId)
  }

  const handleConfirm = () => {
    if (!selected) return
    const isCorrect = selected === correctOptionId
    setRevealed(true)
    onAnswer(selected, isCorrect)
  }

  return (
    <div className="p-4 space-y-3">
      <p className="text-[14px] font-medium text-white leading-relaxed">{questionText}</p>

      <div className="space-y-2">
        {options.map(opt => {
          let bg = 'bg-white/5 hover:bg-white/10'
          if (revealed && opt.id === correctOptionId) bg = 'bg-[#1B7A3C]/20 border-[#1B7A3C]'
          if (revealed && opt.id === selected && opt.id !== correctOptionId) bg = 'bg-[#E63329]/20 border-[#E63329]'
          if (!revealed && opt.id === selected) bg = 'bg-[#1B3FC4]/20 border-[#1B3FC4]'

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`w-full text-left px-4 py-3 rounded-lg border border-white/10 text-[13px] text-white/80 transition-colors ${bg}`}
            >
              {opt.text}
            </button>
          )
        })}
      </div>

      {!revealed && selected && (
        <button
          onClick={handleConfirm}
          className="w-full py-2.5 bg-[#1B3FC4] text-white text-[13px] font-medium rounded-lg"
        >
          Confirm Answer
        </button>
      )}

      {revealed && (
        <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.15em] text-[#F5A623] mb-1">
            Code Reference
          </p>
          <p className="text-[12px] text-white/60 leading-relaxed">{codeCitation}</p>
        </div>
      )}
    </div>
  )
}
```

### 2e. Parametric Slider with Compliance Feedback

```typescript
interface ComplianceSliderProps {
  label: string
  unit: string
  value: number
  min: number
  max: number
  step: number
  codeMin?: number       // Min compliant value
  codeMax?: number       // Max compliant value
  codeSection: string    // e.g. "PD 1096 §7.2.4"
  consequence?: string   // e.g. "Riser too high — unsafe for regular foot traffic"
  onChange: (value: number) => void
}

export function ComplianceSlider({
  label, unit, value, min, max, step,
  codeMin, codeMax, codeSection, consequence, onChange
}: ComplianceSliderProps) {
  const isCompliant = (codeMin === undefined || value >= codeMin) && (codeMax === undefined || value <= codeMax)

  return (
    <div className="py-3 border-b border-white/5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] text-white/60">{label}</span>
        <span className={`font-[family-name:var(--font-dm-mono)] text-[13px] font-medium ${
          isCompliant ? 'text-[#1B7A3C]' : 'text-[#E63329]'
        }`}>
          {value}{unit}
        </span>
      </div>

      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[#1B3FC4]"
      />

      {!isCompliant && (
        <div className="mt-2 p-2 bg-[#E63329]/10 rounded text-[11px] text-[#E63329] leading-relaxed">
          <span className="font-medium">Non-compliant</span> — {codeSection} requires{' '}
          {codeMin !== undefined && `min ${codeMin}${unit}`}
          {codeMin !== undefined && codeMax !== undefined && ', '}
          {codeMax !== undefined && `max ${codeMax}${unit}`}.
          {consequence && ` ${consequence}`}
        </div>
      )}
    </div>
  )
}
```

### 2f. Human Scale Reference

```typescript
// Research: "Person silhouette at 1.7m in ALL building-scale models."
// A standard 3D asset referenced across all modules.

import { useGLTF } from '@react-three/drei'

export function HumanSilhouette({ position = [0, 0, 0] as [number, number, number] }) {
  // Use a simple capsule geometry as placeholder until real model is available
  return (
    <group position={position}>
      {/* Body */}
      <mesh position={[0, 0.85, 0]}>
        <capsuleGeometry args={[0.15, 0.9, 4, 8]} />
        <meshStandardMaterial color="#555555" transparent opacity={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#555555" transparent opacity={0.6} />
      </mesh>
      {/* Scale label */}
      {/* Add Html overlay with "1.7m" label via @react-three/drei Html */}
    </group>
  )
}
```

### 2g. Post-Module CTA (Bridge to Quiz Engine)

```typescript
// Research: "After sandbox/challenge, link directly to Camp Mode for that topic."

interface PostModuleCTAProps {
  topicId: string
  topicName: string
  questionsAnswered: number
  questionsCorrect: number
  aleQuestionCount?: number
}

export function PostModuleCTA({
  topicId, topicName, questionsAnswered, questionsCorrect, aleQuestionCount
}: PostModuleCTAProps) {
  const accuracy = questionsAnswered > 0
    ? Math.round((questionsCorrect / questionsAnswered) * 100)
    : 0

  return (
    <div className="p-6 bg-[#1A1A2E] border-t border-white/10">
      <p className="font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.15em] text-white/30 mb-2">
        Module Complete
      </p>
      <p className="text-[14px] text-white/80 mb-4">
        {questionsAnswered > 0
          ? `${questionsCorrect}/${questionsAnswered} in-canvas questions correct (${accuracy}%).`
          : 'Exploration complete.'
        }
        {aleQuestionCount && ` This topic typically appears as ~${aleQuestionCount} ALE questions.`}
      </p>
      <a
        href={`/dashboard/testing?topic=${topicId}&mode=camp&count=10`}
        className="block w-full py-3 bg-[#1B3FC4] text-white text-center text-[14px] font-medium rounded-lg hover:bg-[#1535A8] transition-colors"
      >
        Answer 10 questions on {topicName} in Camp Mode
      </a>
    </div>
  )
}
```

**STOP.** "Phase 2 Complete. Framework components built. Reply 'Proceed' for first module."

---

## PHASE 3: First Module — PD 1096 Stairway Configurator

This is the highest-priority module (CRITICAL visual impact, most common Building Technology question). It demonstrates the full 4-phase arc.

### 3a. Module Page Route

Create: `/app/dashboard/lab/[slug]/page.tsx`

This is a Server Component that fetches the model data and renders the client-side 3D Lab.

```typescript
// Server Component — fetches model + hotspots + questions
import { createClient } from '@/lib/supabase/server'
import { LabClient } from '@/components/lab/LabClient'

export default async function LabModulePage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: model } = await supabase
    .from('models_3d')
    .select('*, spatial_hotspots(*, questions(*))')
    .eq('slug', params.slug)
    .single()

  if (!model) notFound()

  // Check feature access (Pro for full modes, Free for guided only)
  // ... checkFeatureAccess('3d_lab_full')

  return <LabClient model={model} userId={user?.id} />
}
```

### 3b. Stairway Model (Parametric Three.js)

The stairway is built procedurally — NOT a loaded GLTF. This is the parametric approach.

Create: `src/components/lab/modules/StairwayModel.tsx`

```typescript
'use client'
import { useMemo } from 'react'
import { useLabStore } from '@/stores/lab-store'

// PD 1096 compliant ranges
const CODE = {
  riserMin: 100, riserMax: 200,      // mm
  treadMin: 250, treadMax: 300,      // mm
  widthMin: 1100,                     // mm for exit stairs
  headroomMin: 2100,                  // mm
  handrailMin: 900, handrailMax: 1100 // mm
}

interface StairwayModelProps {
  riserHeight: number    // mm
  treadDepth: number     // mm
  stairWidth: number     // mm
  numSteps: number
  headroom: number       // mm
  handrailHeight: number // mm
}

export function StairwayModel({ riserHeight, treadDepth, stairWidth, numSteps, headroom, handrailHeight }: StairwayModelProps) {
  // Convert mm to Three.js units (meters)
  const r = riserHeight / 1000
  const t = treadDepth / 1000
  const w = stairWidth / 1000

  // Compliance checks
  const riserOk = riserHeight >= CODE.riserMin && riserHeight <= CODE.riserMax
  const treadOk = treadDepth >= CODE.treadMin && treadDepth <= CODE.treadMax
  const widthOk = stairWidth >= CODE.widthMin

  const steps = useMemo(() => {
    return Array.from({ length: numSteps }, (_, i) => ({
      position: [0, r * (i + 1), t * i] as [number, number, number],
      riserColor: riserOk ? '#1B7A3C' : '#E63329',
      treadColor: treadOk ? '#cccccc' : '#E63329',
    }))
  }, [numSteps, r, t, riserOk, treadOk])

  return (
    <group>
      {/* Stair steps */}
      {steps.map((step, i) => (
        <group key={i} position={step.position}>
          {/* Riser (vertical) */}
          <mesh position={[0, -r / 2, -0.01]}>
            <boxGeometry args={[w, r, 0.02]} />
            <meshStandardMaterial color={step.riserColor} />
          </mesh>
          {/* Tread (horizontal) */}
          <mesh position={[0, 0, t / 2]}>
            <boxGeometry args={[w, 0.03, t]} />
            <meshStandardMaterial color={step.treadColor} />
          </mesh>
        </group>
      ))}

      {/* Width indicator — red if non-compliant */}
      {!widthOk && (
        <mesh position={[0, r * numSteps / 2, t * numSteps / 2]}>
          <boxGeometry args={[w, 0.01, t * numSteps]} />
          <meshStandardMaterial color="#E63329" transparent opacity={0.15} />
        </mesh>
      )}
    </group>
  )
}
```

### 3c. Module Content Seed Data

After the module framework is built, seed the database:

```sql
-- Seed PD 1096 Stairway module
INSERT INTO public.models_3d (
  name, slug, url, thumbnail,
  context_scenario,
  ale_question_count, ale_question_type,
  supported_phases, has_challenge_mode,
  status
) VALUES (
  'PD 1096 — Stairway Configurator',
  'pd-1096-stairway',
  '/models/stairway-configurator', -- parametric, not a GLTF URL
  '/thumbnails/stairway.webp',
  'You''re reviewing plans for a 4-story commercial building in Quezon City. The building inspector has flagged the fire exit stairway. Here''s what they found.',
  8,
  'code compliance',
  '{guided,faded,sandbox,challenge}',
  true,
  'published'
);

-- Seed hotspots for the stairway (4 hotspot questions)
-- ADAPT: Replace question_ids with actual UUIDs from the questions table

-- INSERT INTO public.spatial_hotspots (model_id, node_id, title, description, position_x, position_y, position_z, phase, question_id, reveal_order)
-- VALUES
--   ((SELECT model_id FROM models_3d WHERE slug = 'pd-1096-stairway'),
--    (SELECT node_id FROM taxonomy_tree WHERE slug = 'stairway-dimensions'),
--    'Riser Height', 'PD 1096 §7.2.4 — Maximum 200mm for exit stairs', 0, 0.18, 0, 'guided', [question_uuid], 1),
--   ... repeat for tread, width, headroom, handrail
```

**STOP.** "Phase 3 Complete. First module framework built. Reply 'Proceed' for system integration."

---

## PHASE 4: System Integration

### 4a. 3D Lab → Mastery Engine (Most Critical Integration)

When a student answers an in-canvas hotspot question, write to `user_interactions` with `source_type = '3d_lab'`:

```typescript
// Server Action: record3DLabInteraction
export async function record3DLabInteraction(params: {
  userId: string
  sessionId: string
  questionId: string
  topicId: string
  selectedOptionId: string
  isCorrect: boolean
  timeSpentMs: number
}) {
  const supabase = await createClient()

  await supabase.from('user_interactions').insert({
    user_id: params.userId,
    session_id: params.sessionId,
    question_id: params.questionId,
    topic_id: params.topicId,
    selected_option_id: params.selectedOptionId,
    is_correct: params.isCorrect,
    time_spent_ms: params.timeSpentMs,
    source_type: '3d_lab',  // NEW — enables weight differentiation
  })

  // The existing triggers handle the rest:
  // trg_flag_lucky_guess → checks mastery + speed
  // Application code → updates user_node_mastery EMA
  // trg_log_mastery_history → logs mastery change
  // trg_snapshot_readiness → snapshots readiness score
}
```

### 4b. 3D Lab → Camp Trail Integration

When a trail step has `step_type = 'lab'`, the daily view renders:
1. Read `trail_steps.lab_phase` to know which phase to launch
2. Link to `/dashboard/lab/[model-slug]?phase=[lab_phase]`
3. On module completion, write to `user_trail_progress` for this step

### 4c. 3D Lab → Blindspot Protocol Integration

In the Blindspot queue generator, add a routing check:

```typescript
// If a Red node has a corresponding 3D module, suggest Lab before Quiz
const { data: hasModel } = await supabase
  .from('spatial_hotspots')
  .select('model_id')
  .eq('node_id', weakNodeId)
  .limit(1)

if (hasModel && hasModel.length > 0) {
  // Surface: "Before answering questions, see this in the 3D Lab first."
  // This is a UX decision in the Blindspot dashboard widget
}
```

### 4d. 3D Lab → Wiki Bidirectional Link

In the Wiki article renderer, check for related 3D modules:

```typescript
// In the Wiki article Server Component
const { data: relatedModel } = await supabase
  .from('spatial_hotspots')
  .select('model_id, models_3d(name, slug)')
  .eq('node_id', articlePrimaryNodeId)
  .limit(1)
  .single()

// If found, render a CTA: "See this in the 3D Lab →"
```

**STOP.** "Phase 4 Complete. 3D Lab fully integrated with mastery engine, Camp Trail, Blindspot, and Wiki."

---

## BUILD PRIORITY (From Integration Analysis Part 8)

| # | Module | Visual Impact | Interaction Type | Build Complexity |
|---|---|---|---|---|
| 1 | PD 1096 Stairway | CRITICAL | Parametric | Medium — procedural geometry |
| 2 | RA 9514 Travel Distance | CRITICAL | Floor plan | Medium — 2D floor plan with zones |
| 3 | BP 344 Accessible Toilet + Ramp | CRITICAL | Parametric | High — many interacting dimensions |
| 4 | PD 1096 Setbacks/AMBF | CRITICAL | Site geometry | High — area calculations |
| 5 | Classical Orders | HIGH | Comparison/discrimination | Different component entirely |
| 6 | NSCP Structural Bay | HIGH | Progressive disclosure | High — structural engineering |

**Build modules 1–3 first.** They share the same parametric framework. Module 5 (Classical Orders) needs a completely different component — scope separately.

---

## ANTI-PATTERN CHECKLIST (Run Before Shipping Any Module)

| Check | Pass/Fail |
|---|---|
| Does the model show ≤3 labeled dimensions in default state? | |
| Can the student change at least one parameter? | |
| Does the module display ALE question count? | |
| Are labels hidden until AFTER the student answers? | |
| Does Focus Mode work (one dimension highlighted, others dimmed)? | |
| Is a human silhouette visible at 1.7m scale? | |
| Does the post-module CTA link to Camp Mode for this topic? | |
| Do in-canvas answers write to `user_interactions` with `source_type: '3d_lab'`? | |
| Does the context scenario appear at module open? | |

---

## WHAT NOT TO DO

- **Don't ship a module without at least Phase 1 (Guided) + Phase 2 (Faded).** A passive-only model violates the research. Every module must have at least one interactive element.
- **Don't show all labels before the student answers.** Testing-effect sequence: question FIRST, then reveal. This is the research's hardest constraint.
- **Don't build Classical Orders as a parametric module.** It's discrimination training — side-by-side comparison, not slider-based. Different component.
- **Don't put code citations on a separate screen.** Contiguity Principle: model + code visible simultaneously. Split panel or stacked, never navigated away.
- **Don't default to full 3D orbit on mobile.** Default to fixed-angle flat view. "3D View" is an explicit opt-in toggle.
- **Don't build Professional Practice topics as 3D modules.** The research explicitly marks them LOW visual impact. Use Wiki infographics.
- **Don't disconnect 3D Lab from the mastery engine.** Every in-canvas answer writes to `user_interactions`. If the Heatmap doesn't change after a 3D session, students will perceive it as optional.

---

*Execute Phase 1 now. Run the schema pre-flight, then the migration.*
