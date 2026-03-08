# Cerebro — Feature Tree

Complete hierarchy of every feature, organized by where it lives in the app.

---

```
CEREBRO
│
├── AUTH & ONBOARDING
│   ├── Sign Up (Email + Google OAuth + Magic Link)
│   ├── Login
│   ├── Forgot Password
│   └── Onboarding Flow
│       ├── 1. Select Board Exam → creates Exam Profile
│       ├── 2. Set Target Exam Date
│       ├── 3. Study Intensity (hours/day)
│       ├── 4. Diagnostic Quiz (optional, 10 Qs)
│       └── 5. Plan Selection (Free / Pro / Max)
│
├── EXAM PROFILE SWITCHER [always in header]
│   ├── Dropdown list of user's Exam Profiles
│   ├── Active profile indicator (dot + name)
│   ├── Switch profile → instant context reload
│   ├── + Add New Exam Profile
│   └── "Coming Soon" badge for exams without content
│
├── DASHBOARD [scoped to active Exam Profile]
│   ├── Today's Mission
│   │   ├── SRS cards due (Pro/Max) + [Start Review]
│   │   ├── Suggested session (based on weak areas)
│   │   └── Daily study goal progress bar
│   ├── Subject Cards Grid
│   │   ├── Subject name, icon, color accent
│   │   ├── Question count in pool
│   │   ├── Mastery % (Pro/Max)
│   │   ├── [▶ Quick Start] → Subject Quick-Start
│   │   ├── [Browse 3D] → 3D Workspace (if available)
│   │   └── Click card → Subject Detail Page
│   ├── Stats Bar
│   │   ├── Exam Countdown (days remaining)
│   │   ├── Streak (current + longest)
│   │   ├── Total Qs Answered
│   │   └── Overall Mastery %
│   ├── Recent Sessions (last 5)
│   │   ├── Name, date, score, duration
│   │   ├── [Retake] button
│   │   └── [View Details]
│   └── Quick Actions
│       ├── [+ New Session] → Session Builder
│       ├── [📋 SRS Review] → SRS Mode (Pro/Max)
│       ├── [📄 Upload PDF] → PDF Ingestion (Pro/Max)
│       └── [🎯 Weak Areas] → AI-selected session (Max)
│
├── REVIEW MODE [the "doomscroll"]
│   ├── Infinite scroll, one question per screen
│   ├── Subject/Topic filter (top bar)
│   ├── Tap answer → rich panel expands:
│   │   ├── ✓/✗ indicator
│   │   ├── Correct answer highlighted
│   │   ├── Explanation (markdown)
│   │   ├── Explanation image
│   │   ├── References (book, code, article links)
│   │   ├── Fun Facts
│   │   ├── Mnemonics
│   │   ├── Related Topics (tap to explore)
│   │   └── [See in 3D] (if has_3d_component)
│   ├── Swipe up / [Next] for next question
│   ├── NO progress bar, NO score, NO timer
│   ├── NO analytics shown to user (intentionally stress-free)
│   └── Lightweight tracking (review_mode_interactions table)
│
├── SESSIONS MODE [tracked, analytics-driven]
│   │
│   ├── Subject Quick-Start
│   │   ├── From dashboard subject card → [▶ Start]
│   │   ├── Quick settings: count (10/25/50/100), difficulty, timer
│   │   └── → Starts quiz immediately
│   │
│   ├── Custom Session Builder
│   │   ├── Step 1: Name (optional)
│   │   ├── Step 2: Select subjects + count per subject
│   │   │   ├── Checkbox per subject
│   │   │   ├── Number stepper (5/10/15/20/25/50)
│   │   │   └── Running total display
│   │   ├── Step 3: Settings
│   │   │   ├── Difficulty (Easy/Medium/Hard/Expert/Mixed)
│   │   │   ├── Timer (None / Per Question / Total)
│   │   │   ├── Shuffle Questions (on/off)
│   │   │   ├── Shuffle Choices (on/off)
│   │   │   ├── Show Immediate Feedback (on/off)
│   │   │   └── (Max) Hand-pick specific questions per subject
│   │   ├── Step 4: Summary → [Save Template] + [Start →]
│   │   └── Templates Tab
│   │       ├── Saved templates list
│   │       ├── [Use] → pre-fills builder
│   │       └── [Edit] / [Delete]
│   │
│   ├── Quiz Engine (THE CORE SCREEN)
│   │   ├── Progress bar (top, amber)
│   │   ├── Timer (top-right, if enabled, monospace)
│   │   ├── Question # + subject badge (top-left)
│   │   ├── Question prompt (centered, markdown, LaTeX, images)
│   │   ├── Answer choices (full-width, 48px min, 12px gap)
│   │   ├── [Skip] (bottom-left) / [Bookmark] (bottom-right)
│   │   ├── After answering:
│   │   │   ├── ✓/✗ feedback animation
│   │   │   ├── Explanation panel (slides up)
│   │   │   ├── References, fun facts, images
│   │   │   ├── (Pro/Max) "Seen 5x, correct 3x (60%)"
│   │   │   ├── [Ask AI Tutor] (Max, on wrong answers)
│   │   │   ├── [View 3D Model] (if has_3d_component)
│   │   │   └── [Next →] / Enter key / swipe right
│   │   ├── Keyboard: 1-4 answers, Enter next, Esc exit
│   │   └── Pause/Resume: exit mid-session → resume later
│   │
│   ├── Session Summary
│   │   ├── Score (big number, animated)
│   │   ├── Per-subject breakdown table
│   │   ├── Time stats (total, avg per question)
│   │   ├── Hardest questions (ones got wrong)
│   │   ├── (Retake) Comparison: "72% → 85% (+13%)"
│   │   ├── (Pro/Max) AI Insight paragraph
│   │   ├── [Retake This Session]
│   │   ├── [Review Wrong Answers]
│   │   └── [Back to Dashboard]
│   │
│   ├── Session History
│   │   ├── All past sessions, sortable/filterable
│   │   ├── [Retake] any session (same questions)
│   │   └── [Compare] two sessions side-by-side
│   │
│   └── Session Types Summary
│       ├── subject_quick — one tap from dashboard
│       ├── custom_compiled — multi-subject builder
│       ├── topic_drill — deep dive into one topic
│       ├── srs_review — algorithm-driven queue (Pro/Max)
│       ├── ai_adaptive — IRT difficulty targeting (Max)
│       ├── retake — same questions, comparison analytics
│       ├── 3d_model_quiz — questions linked to 3D model
│       └── weak_areas — AI-selected weakest topics (Max)
│
├── 3D LIBRARY (Pro/Max)
│   ├── 3D Workspace Browser
│   │   ├── Grid of models per subject
│   │   ├── Thumbnail, name, topic, callout count
│   │   └── Search and filter
│   ├── 3D Model Viewer
│   │   ├── Full-screen 3D canvas
│   │   ├── OrbitControls (rotate, zoom, pan)
│   │   ├── Callout Points (floating labels in 3D)
│   │   │   ├── Tap → info panel
│   │   │   ├── Label, description, image
│   │   │   └── [Quiz Me on This]
│   │   ├── Layer Toggle (structure, envelope, MEP)
│   │   ├── Explode View
│   │   ├── Cross-Section Slicer
│   │   └── [Start Full Quiz from This Model]
│   └── 3D Quiz (split view)
│       ├── Desktop: 3D left + question right
│       ├── Mobile: 3D above + question below
│       └── 3D auto-focuses on relevant element per question
│
├── ANALYTICS (Pro/Max, basic stats for Free)
│   ├── Overview Dashboard
│   │   ├── Subject Mastery Radar Chart
│   │   ├── Weekly Activity Heatmap
│   │   ├── Study Time Tracker (daily/weekly/monthly)
│   │   ├── Predicted Exam Score gauge (Max)
│   │   └── Improvement velocity
│   ├── Subject Analytics (drill into one)
│   │   ├── Accuracy trend over time
│   │   ├── Topic-level breakdown
│   │   ├── Response time analysis
│   │   ├── Difficulty distribution
│   │   └── Most missed questions
│   ├── Question Analytics
│   │   ├── Per-question: times seen, correct, wrong, accuracy %, avg time
│   │   ├── Accuracy trend per question (improving? declining?)
│   │   ├── Every attempt with date, session, result
│   │   ├── Filter: most missed, never seen, mastered, bookmarked
│   │   └── SRS schedule (next review date)
│   ├── Study Time
│   │   ├── Time in Review Mode (passive)
│   │   ├── Time in Sessions Mode (active)
│   │   ├── Time in 3D Library
│   │   ├── Daily/weekly/monthly totals
│   │   ├── Target: "2 hours/day" → progress bar
│   │   └── Idle detection (2 min timeout)
│   └── AI Insights (Max)
│       ├── Weekly AI-generated study report
│       ├── Prescriptive: "Add 1hr/day to Structures"
│       ├── Weak topic prediction
│       ├── Study schedule recommendation
│       └── Pass/fail prediction with confidence %
│
├── AI FEATURES
│   ├── SRS Review (Pro/Max)
│   │   ├── SM-2 algorithm
│   │   ├── Queue scoped per exam_profile
│   │   └── Overdue-first ordering
│   ├── PDF Ingestion (Pro/Max)
│   │   ├── Upload → parse → chunk → embed → store
│   │   └── Optional: AI-generate questions from content
│   ├── Socratic Tutor (Max)
│   │   ├── Triggered from wrong answers
│   │   ├── RAG: retrieves user's uploaded docs
│   │   ├── Guides with questions, doesn't give answers
│   │   └── Standalone chat mode too
│   └── Adaptive Engine (Max)
│       ├── IRT 2PL model
│       ├── Targets P(correct) ≈ 0.75
│       ├── Theta estimation per domain
│       └── Predictive score modeling
│
├── LIBRARY & MARKETPLACE
│   ├── My Question Banks (created + purchased)
│   ├── Upload PDF → AI ingestion (Pro/Max)
│   └── Marketplace
│       ├── Browse by profession/subject
│       ├── Ratings, reviews, price
│       ├── Preview (5 sample questions)
│       ├── Purchase (Stripe one-time)
│       └── Seller flow: create → review → price → publish
│
├── SUBJECTS (accessed from dashboard or nav)
│   └── Subject Detail Page
│       ├── Overview (description, exam weight, mastery %)
│       ├── Topics list (nested tree)
│       │   └── Each topic: question count, mastery %, [Drill]
│       ├── Performance chart
│       ├── Question browser (all Qs in subject)
│       │   └── Filter: topic, difficulty, seen/unseen/mastered
│       ├── [▶ Start Session]
│       └── [🧊 3D Workspace]
│
└── SETTINGS
    ├── Profile (name, avatar, email)
    ├── Exam Profiles (manage all)
    ├── Appearance (light/dark/system)
    ├── Quiz Preferences (default timer, feedback mode, etc.)
    ├── Notifications (streak reminders, weekly report)
    ├── Billing (Stripe Customer Portal)
    └── Data Export (download everything)
```
