# Cerebro Product Requirements Document (PRD)

## Overview

**Cerebro** is an AI-powered learning platform designed specifically for **architecture students and architecture board exam takers**. It serves as a "second brain" — a comprehensive study companion that combines knowledge management, active learning through testing, visual 3D learning, note-taking, and detailed performance analytics.

---

## Target Audience

**Primary:** Architecture students preparing for board examinations (ALE - Architects Licensure Examination, ARE - Architect Registration Examination)

**Secondary:** Architecture students in undergraduate/graduate programs seeking supplemental learning tools

**Future Expansion:** Other professional board exams (engineering, nursing, law, etc.)

---

## Core Value Proposition

> "Everything you need to pass your architecture board exams — knowledge, practice, visualization, and insights — in one intelligent platform."

---

## Feature Requirements

### 1. Wiki — Central Knowledge Base

**Purpose:** Comprehensive, searchable knowledge repository for architecture concepts, theories, history, codes, and materials.

**Key Capabilities:**
- Hierarchical category system (subjects → topics → subtopics)
- Full-text search with PostgreSQL FTS
- Bi-directional page linking (wiki-style connections)
- Rich content with images, diagrams, and formatted text
- Cross-references to related quiz questions
- Public read access for all users
- Admin/curator editing capabilities

**Content Areas:**
- Architectural Theory & History
- Building Technology & Materials
- Structural Concepts
- Environmental Systems
- Professional Practice
- Building Codes & Regulations
- Design Methods

---

### 2. Testing — Quizzing & Assessment

**Purpose:** Active learning through practice questions with comprehensive tracking and analytics.

**Two Modes:**

#### A. Sessions Mode (Tracked)
- Full analytics and performance tracking
- Multiple session types:
  - Quick Start (random questions)
  - Subject Drill (focused on specific subjects)
  - Topic Drill (deep dive into topics)
  - SRS Review (spaced repetition queue)
  - Custom Sessions (user-defined parameters)
  - Retake Mode (previously missed questions)
- Timer support (optional)
- Question bookmarking
- Session summaries with detailed breakdowns
- Shareable results

#### B. Review Mode (Stress-Free)
- "Doomscroll" interface — swipe through questions
- No scores, no timers, no analytics display
- Confidence tap feature (mark how confident you felt)
- Immediate answer reveal
- Designed for low-pressure learning

**Question Features:**
- Rich content: explanations, references, fun facts, mnemonics, images
- Multiple question types: MCQ, True/False, Identification, Matching
- Difficulty levels: Easy, Medium, Hard, Expert
- Question banks organized by exam and subject

---

### 3. 3D Learning — Visual Learning

**Purpose:** Interactive 3D models for understanding spatial architectural concepts that are difficult to grasp from 2D diagrams.

**Key Capabilities:**
- Interactive 3D model viewer (React Three Fiber)
- Info clouds/callouts on model hotspots
- Model categories: Orders, Structural Elements, Historical Buildings, Construction Details
- Quiz integration within 3D context
- Tier-gated access (Pro/Max plans)
- Mock data for: Greek Parthenon, Roman Pantheon, Corinthian Capital, etc.

**Use Cases:**
- Understanding classical orders (Doric, Ionic, Corinthian)
- Visualizing structural systems
- Exploring historical buildings
- Learning construction assemblies

---

### 4. Note Taking — Personal Knowledge Capture

**Purpose:** Rich-text note-taking integrated with wiki subjects and AI study assistance.

**Key Capabilities:**
- Tiptap-based rich text editor
- Notes organized by wiki subject categories
- Pin/unpin important notes
- Debounced auto-save (800ms)
- AI Study Agent integration:
  - Summarize note content
  - Generate flashcards from notes
  - Check understanding with questions
- Real-time collaboration ready (Supabase Realtime)
- Export capabilities

---

### 5. Analytics — Performance Tracking

**Purpose:** Comprehensive insights into learning progress, strengths, and areas for improvement.

**Dashboard Components:**

#### Readiness Score (F-01)
Composite score (0-100) based on:
- Accuracy across all questions
- Subject coverage completeness
- SRS queue health
- Study recency
- Weak area improvement

#### Daily Mission (F-02)
Personalized daily study goal with:
- Question count target
- Time spent goal
- Subject focus recommendation
- Streak maintenance

#### Subject Mastery
- Per-subject mastery scores using IRT (Item Response Theory)
- Visual mastery grid
- Progress over time
- Weak area identification

#### Study Analytics
- Time tracking per mode (Review, Sessions, 3D Lab, Notes, Wiki)
- Daily/weekly/monthly views
- Session history with detailed breakdowns
- Question performance stats
- Streak tracking

#### Final Stretch Mode (F-09)
Special analytics view for users within 30 days of exam:
- Intensive study recommendations
- High-yield topic focus
- Mock exam simulations
- Confidence assessments

---

## User Tiers

| Feature | Free | Pro | Max |
|---------|------|-----|-----|
| Wiki Access | Read-only | Read-only | Read-only |
| Review Mode | Unlimited | Unlimited | Unlimited |
| Sessions Mode | 20 questions/day | Unlimited | Unlimited |
| 3D Learning | 3 models | All models | All models |
| Notes | 10 notes | 100 notes | Unlimited |
| Analytics | Basic | Advanced | Advanced |
| SRS | Limited | Full | Full |
| AI Study Agent | - | Included | Included |

---

## Technical Requirements

### Performance
- Page load < 2 seconds
- 3D model interaction at 60fps
- Real-time updates for notes

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode

### Offline Support
- PWA capabilities (Phase 2)
- Cached quiz sessions
- Offline note access

---

## Success Metrics

### User Engagement
- Daily Active Users (DAU)
- Average session duration
- Questions answered per user per day
- Notes created per user
- 3D model interactions

### Learning Outcomes
- Pass rate correlation (survey-based)
- Readiness score improvement over time
- Subject mastery progression
- Time-to-exam completion

### Business Metrics
- Free-to-paid conversion rate
- Churn rate by tier
- Net Promoter Score (NPS)

---

## Future Roadmap

### Phase 2 (Post-Launch)
- AI Tutor chat interface
- Study groups and collaboration
- Mobile apps (iOS/Android)
- Additional exam types (engineering, nursing)
- PWA offline support

### Phase 3 (Scale)
- Institution/enterprise plans
- White-label options
- Content marketplace
- AI-generated questions

---

## Design Principles

**Rams Standard (Braun/Dieter Rams inspired):**
- Achromatic base with functional accents
- Primary CTA: `#ED8008` (amber)
- Correct: `#34C759` | Incorrect: `#FF3B30`
- No gradients, no heavy shadows
- 150ms transitions
- Mobile-first, 720px max-width for quiz UI
- Content-first, chrome-less design

---

## Related Documents

- `DATABASE_SCHEMA.sql` — Database source of truth
- `CLAUDE.md` — Developer guide and architecture decisions
- Design tokens in `src/app/globals.css`
