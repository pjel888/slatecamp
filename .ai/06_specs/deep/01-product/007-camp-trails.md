# Camp Trails

**Analysis Date:** 2026-04-06

## Overview

Camp Trails are structured study paths that guide students through the LEA curriculum over a defined period. Each trail is a curated sequence of daily steps mixing wiki reads, quizzes, 3D lab sessions, and reviews.

**Source:** `src/components/trails/` (22 files), `src/lib/queries/trails.ts`, `src/types/app.ts`

## Trail Types

```typescript
type TrailType = 
  | 'time_gated'       // Fixed start date, daily milestones
  | 'subject_mastery'  // Master subjects in sequence
  | 'code_deep_dive'  // Intensive building code focus
  | 'remediation'      // Address specific weak areas
  | 'exam_simulation'; // Full exam preparation path
```

**Source:** `src/types/app.ts` (line 717)

## Trail Intensity

```typescript
type TrailIntensity = 
  | 'intensive'       // 2+ hours/day
  | 'accelerated'     // 1.5 hours/day
  | 'standard'        // 1 hour/day
  | 'comprehensive'   // 30 min/day
  | 'undergraduate';  // Flexible, relaxed pace
```

**Source:** `src/types/app.ts` (line 718)

## Trail Structure

```typescript
interface CampTrail {
  trail_id: string;
  discipline_id: string;
  name: string;
  slug: string;
  description: string | null;
  trail_type: TrailType;
  intensity: TrailIntensity | null;
  duration_days: number;
  total_steps: number;
  daily_time_estimate_minutes: number;
  subjects_covered: string[];
  is_published: boolean;
  is_featured: boolean;
  is_free: boolean;
  recommended_min_score: number | null;
  recommended_max_score: number | null;
}

interface TrailDay {
  day_id: string;
  trail_id: string;
  day_number: number;
  title: string;
  description: string | null;
  estimated_minutes: number;
  subject_focus: string | null;
  subject_color: string | null;
  is_rest_day: boolean;
  is_phase_transition: boolean;
  phase_name: string | null;
  steps?: TrailStep[];
}

interface TrailStep {
  step_id: string;
  day_id: string;
  step_order: number;
  step_type: TrailStepType;
  title: string;
  target_node_ids: string[];
  question_count: number | null;
  difficulty_min: number;
  difficulty_max: number;
  article_id: string | null;
  model_id: string | null;
  estimated_minutes: number;
  is_optional: boolean;
  is_computation_heavy: boolean;
  lab_phase: string | null;
}
```

**Source:** `src/types/app.ts` (lines 722–778)

## Step Types

```typescript
type TrailStepType = 'quiz' | 'wiki' | 'lab' | 'review';

const STEP_TYPE_CONFIG = {
  wiki:   { icon: '📖', label: 'WIKI READ', cta: 'Start Reading →' },
  quiz:   { icon: '⚡', label: 'QUIZ',       cta: 'Start Quiz →' },
  lab:    { icon: '🏛️', label: '3D LAB',    cta: 'Open 3D Lab →' },
  review: { icon: '🔄', label: 'REVIEW',     cta: 'Start Review →' },
};
```

**Source:** `src/types/app.ts` (lines 863–868)

## Enrollment & Progress

```typescript
interface TrailEnrollment {
  enrollment_id: string;
  user_id: string;
  trail_id: string;
  status: TrailEnrollmentStatus;
  current_day: number;
  days_completed: number;
  pace_status: string;  // 'ahead' | 'on_track' | 'behind'
  readiness_score_at_start: number | null;
  target_completion_date: string | null;
}

type TrailEnrollmentStatus = 'active' | 'paused' | 'completed' | 'abandoned';

interface TrailProgress {
  progress_id: string;
  enrollment_id: string;
  step_id: string;
  completed_at: string;
  session_id: string | null;
  time_spent_ms: number | null;
}
```

**Source:** `src/types/app.ts` (lines 780–809)

## Trail Routes

| Route | Purpose |
|-------|---------|
| `/dashboard/trails` | Trail library and list |
| `/dashboard/trails/[slug]` | Trail detail view |
| `/dashboard/trails/[slug]/today` | Today's steps |
| `/dashboard/camptrails` | Active trail management |

**Source:** `src/app/dashboard/trails/`, `src/app/dashboard/camptrails/`

## Phase System

Trails can have phase transitions where the subject focus shifts:
- **Phase name:** e.g., "Foundation", "Intensive Practice", "Mock Exams"
- **Phase transition:** Marked by `is_phase_transition: true` on `TrailDay`
- **Color-coded:** Each phase has a `subject_color` for visual distinction

**Subject colors:**
```typescript
const SUBJECT_COLORS: Record<string, string> = {
  'Building Laws': '#1B3FC4',
  'Fire & Life Safety': '#E63329',
  'Structural Design': '#E8853A',
  'Materials & Methods': '#1B7A3C',
  'MEPF Utilities': '#534AB7',
  'History & Theory': '#F5A623',
  'Planning': '#6B9B37',
  'Professional Practice': '#4A7B9D',
};
```

**Source:** `src/types/app.ts` (lines 871–880)

## Trail Recommendations

The system can recommend trails based on:
- Current Readiness Score
- Exam target date
- Weak subject areas
- Trail type preference

```typescript
interface TrailRecommendation {
  trail: CampTrail;
  reasoning: string;
  weekOnePreview: string;
  isRetaker?: boolean;
}
```

**Source:** `src/types/app.ts` (lines 824–829)

## Query Functions

```typescript
// src/lib/queries/trails.ts
getPublishedTrails()                    // All published trails
getUserTrailEnrollment(userId)          // User's active/completed enrollments
getTrailProgress(enrollmentId)          // Step completion records
getTrailRecommendations(userId)        // Personalized recommendations
```

**Source:** `src/lib/queries/trails.ts`

---

*Camp Trails analysis: 2026-04-06*
