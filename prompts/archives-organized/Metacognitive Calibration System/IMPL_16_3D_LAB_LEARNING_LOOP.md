# IMPL_16: 3D Lab Learning Loop — In-Lab Quiz, Code Compliance Toggle, Bidirectional Links

**Priority:** P1  
**Effort:** ~1 week  
**Research basis:** Level 3 Interactivity (manipulate + receive feedback) produces the highest learning outcomes (Moreno & Mayer, 2007). Situated learning theory (Lave & Wenger, 1991) — learning in authentic contexts transfers to real performance.

---

## 1. In-Lab Quiz Mode

### Concept

While exploring a 3D model, contextual quiz questions trigger based on what the student is examining. Student looks at a stairway → question appears: "What is the minimum clear width for this building type?" Answer correctly to unlock the next annotation.

### Implementation

**File:** `src/components/3d/InLabQuiz.tsx`

Uses the existing `@react-three/drei` `<Html>` component to render quiz UI anchored to 3D positions.

```typescript
interface LabQuizTrigger {
  hotspotId: string;          // Links to spatial_hotspots table
  questionId: string;         // Links to questions table
  position: [number, number, number]; // 3D position
  triggerDistance: number;     // Camera distance to trigger
  unlockNext: string | null;  // Next hotspot to unlock on correct answer
}
```

**Trigger logic:**
```typescript
// In the main 3D Workspace component (src/components/3d/Workspace.tsx)
// On each frame, check camera distance to quiz triggers

useFrame(({ camera }) => {
  for (const trigger of quizTriggers) {
    const distance = camera.position.distanceTo(
      new THREE.Vector3(...trigger.position)
    );
    if (distance < trigger.triggerDistance && !trigger.answered) {
      setActiveQuiz(trigger);
    }
  }
});
```

**Quiz overlay:**
- Question renders as a `<Html>` overlay near the hotspot
- 4 option buttons styled with Campfire design (Camp Cobalt selection, Emerald correct, Warm Red incorrect)
- On correct: hotspot turns Emerald, next hotspot unlocks with a subtle glow
- On incorrect: brief rationale tooltip, hotspot stays neutral, student can retry after viewing rationale
- All interactions recorded in `user_interactions` with `test_mode = 'lab_quiz'`

### Schema Addition

```sql
-- Link hotspots to quiz questions
ALTER TABLE spatial_hotspots ADD COLUMN linked_question_id UUID REFERENCES questions(id);
ALTER TABLE spatial_hotspots ADD COLUMN quiz_trigger_distance NUMERIC(6,2) DEFAULT 5.0;
ALTER TABLE spatial_hotspots ADD COLUMN unlock_order INTEGER; -- Sequential unlock gating
```

---

## 2. Before/After Code Compliance Toggle

### Concept

Show the building in "as-designed" state vs. "code-compliant" state. Student toggles between them to see exactly what changes when code is applied.

### Implementation

**File:** `src/components/3d/ComplianceToggle.tsx`

```typescript
interface ComplianceState {
  parameter: string;         // e.g., 'stairway_width'
  asDesigned: number;        // e.g., 900 (mm) — violating
  codeCompliant: number;     // e.g., 1100 (mm) — correct
  codeReference: string;     // e.g., 'PD 1096 Rule 8, Section 805'
  unit: string;              // 'mm'
}

// Toggle button in the 3D Lab toolbar
const [showCompliant, setShowCompliant] = useState(false);

// On toggle, smoothly interpolate all parametric values
// from asDesigned → codeCompliant (or vice versa)
useEffect(() => {
  for (const state of complianceStates) {
    const targetValue = showCompliant ? state.codeCompliant : state.asDesigned;
    // Use GSAP or spring animation to interpolate
    gsap.to(parameterRef.current, {
      [state.parameter]: targetValue,
      duration: 0.8,
      ease: 'power2.inOut',
    });
  }
}, [showCompliant]);
```

**Visual treatment:**
- Toggle button: "As Designed" ↔ "Code Compliant" with a smooth slide animation
- During transition: violating geometry morphs to compliant geometry
- Annotations appear showing the delta: "Stairway width: 900mm → 1,100mm (+200mm) per PD 1096 Rule 8"
- Non-compliant elements in "As Designed" view use Warm Red `#D64545` material
- Compliant elements use neutral white/gray

### Bounds Breaking (from IP_EXECUTION_PLAN)

When parametric sliders exceed code limits:

```typescript
// In Workspace.tsx, watch slider values
useEffect(() => {
  for (const param of parameters) {
    if (param.value > param.maxCodeLimit) {
      // Transition material to Warm Red
      meshRef.current.material.color.set(new THREE.Color('#D64545'));

      // Show violation annotation via drei Html
      setViolation({
        message: `Violation: ${param.codeReference}`,
        current: param.value,
        limit: param.maxCodeLimit,
        unit: param.unit,
      });
    } else {
      // Restore neutral material
      meshRef.current.material.color.set(new THREE.Color('#FFFFFF'));
      setViolation(null);
    }
  }
}, [parameters]);
```

---

## 3. Bidirectional 3D → Quiz → Wiki Loop

### The Loop

Every 3D interaction should close into a quiz question and a Wiki article:

```
┌─────────┐     click hotspot      ┌──────────┐     get wrong     ┌──────────┐
│  3D Lab  │ ──────────────────────→│ Lab Quiz │ ────────────────→ │   Wiki   │
│  Model   │                        │ Question │                   │ Article  │
└─────────┘                        └──────────┘                   └──────────┘
     ↑                                                                 │
     │              "Return to 3D"  ←──────────────────────────────────┘
     └─────────────────────────────────────────────────────────────────┘
```

### Implementation

**Hotspot → Question:** Each `spatial_hotspot` links to a `question_id` (new FK above). Clicking the hotspot in exploration mode shows info; in quiz mode, it triggers the question.

**Question → Wiki:** Each question already has `topic_id` which maps to `wiki_articles` via `wiki_article_taxonomy`. The FeedbackPanel's Teleport Link works here.

**Wiki → 3D:** Add to Wiki articles that have associated 3D models:

```typescript
// In WikiArticle component, detect if topic has a 3D model
const { data: model } = await supabase
  .from('models_3d')
  .select('id, name, thumbnail_url')
  .eq('topic_id', article.topic_id)
  .single();

if (model) {
  // Render a "See in 3D" card within the article
  // Links to /lab/[modelId] with the relevant hotspot pre-focused
}
```

**3D → Quiz Results → 3D:** After completing an in-lab quiz sequence, show results overlay within the 3D environment (not navigating away). Student stays in the lab context.

---

## Metrics

- Lab Quiz completion rate (% of triggered quizzes answered)
- Compliance Toggle interaction count per session
- 3D → Wiki navigation rate (% of lab sessions that lead to Wiki reading)
- Lab Quiz accuracy vs. regular quiz accuracy on same topics (measures spatial learning benefit)
- Code violation trigger rate (% of sessions where student deliberately exceeds limits — indicates experimentation, which is good)

---

## Campfire Design

- In-lab quiz: minimal UI. Question floats near the relevant geometry. Options are compact buttons.
- Violation overlay: Warm Red text on semi-transparent dark background. Code citation in monospace.
- "See in 3D" card in Wiki: thumbnail of the 3D model, Camp Cobalt border, subtle hover animation
- Compliance toggle: clean switch component in the 3D toolbar, not a jarring UI element
- All 3D UI maintains 60fps target — quiz overlays use `<Html>` which doesn't impact WebGL render loop
