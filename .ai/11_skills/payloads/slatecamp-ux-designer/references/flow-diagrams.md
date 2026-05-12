# SlateCamp Flow Diagrams

## Flow 1: Onboarding (New User)

```
[Landing Page]
    ↓ CTA: "Get Your Free Readiness Score"
[Sign Up Screen]
  → Email + Password
  → "Already have an account? Log in"
    ↓ Account created
[Onboarding Step 1: Context]
  "Before we build your map, tell us about your situation."
  → "When is your exam?" (date picker)
  → "Have you taken the LEA before?" (Yes / No / Not scheduled yet)
    ↓
[Onboarding Step 2: Expectation Setting]
  "You're about to take a 20-minute orientation quiz.
   Answer honestly — the score only helps if it's real."
  CTA: "Start Orientation Quiz"
    ↓
[Diagnostic Quiz — 45 questions, mixed disciplines]
  - Camp Mode interface (with explanations)
  - Progress indicator only, no timer
  - Can pause and resume (saves state)
    ↓ 45/45 complete
[Score Reveal Screen] ← HIGHEST STAKES MOMENT
    ↓
[Free user → see score, then paywall after 3 sec delay]
[Pro user → see score + Trail setup prompt]
    ↓ (free user clicks "Not yet")
[Heatmap First Look]
  - Tooltip overlay: "This is your map. Red = focus here."
  - CTA: "See Today's Trail" → leads to...
    ↓
[Camp Trail — Day 1]
  CTA: "Start Day 1"
    ↓ Or dismisses tooltip
[Dashboard — home state]
```

**Onboarding success metrics:**
- Time to first score: target < 25 min
- Diagnostic completion rate: target ≥85%
- Day 1 → Day 2 return: target ≥55%

---

## Flow 2: Daily Study Loop (Returning User)

```
[App Open → Dashboard]
  Score visible: YES
  Trail Day visible: YES — "Day 14 ready"
    ↓ Tap "Start Day 14"
[Camp Trail Day 14 Screen]
  Shows: title, topics, estimated time
  CTA: "Start Session 1 of 3"
    ↓
[Quiz Session — Camp Mode]
  45 questions, with explanations after each
    ↓ Complete
[Session Completion Screen]
  Score: 80% · ▲ +3 mastery in Structural Systems
  CTA: "Start Session 2" or "Take a break"
    ↓ (after all 3 sessions or break)
[Day 14 Complete — brief celebration]
  "Day 14 complete. Your Heatmap updated."
  CTA: "See Changes" → Heatmap
  CTA: "Back to Trail" → Camp Trail
    ↓
[Heatmap — shows delta since yesterday]
  Changed nodes highlighted
  CTA: "Continue Tomorrow"
    ↓
[Dashboard — updated score visible]
```

---

## Flow 3: Paywall → Pro Conversion

```
[Free User — Score Reveal]
  Score: 62 (Amber Zone)
  CTA: "See Your Trail" ← Primary
    ↓ 3 sec delay, then:
[Soft Gate: "Your live score is a Pro feature"]
  Shows: what Pro score looks like (trajectory chart blurred)
  CTA: "Enroll in Camp" (primary)
  CTA: "Continue free" (tertiary)
    ↓ User taps "Continue free"
[Dashboard — with persistent Pro nudge card]
  Card: "See your score after every session → Go Pro"
  Shown: once per day maximum
    ↓ After 3 free sessions, harder nudge:
[Paywall Screen — full screen]
  Full feature comparison
  Social proof
  CTA: "Enroll in Camp — ₱299/mo"
  CTA: "Not yet — continue free" (always visible)
    ↓ User taps primary CTA
[Payment Screen]
  Toggle: Monthly | Annual
  Payment: GCash | Card | Bank
    ↓ Payment success
[Pro Confirmation — full screen green]
  "Welcome to Camp, [name]."
  "Your live Readiness Score is now active."
    ↓ 2 sec auto-advance
[Dashboard — Pro state, live score visible]
```

---

## Flow 4: Blindspot Protocol Activation

```
[System detects: "Building Laws" node Red for 3+ weeks]
    ↓ Application-layer trigger
[Push Notification OR In-app Banner]
  "Building Laws has been Red for 3 weeks.
   A focused remediation session is ready."
  CTA: "Start Blindspot Session"
    ↓ User taps
[Blindspot Protocol Screen]
  Title: "Blindspot Protocol"
  Subtitle: "Building Laws — Targeted Remediation"

  Shows: node cluster (Building Laws topics in red)
  Estimated: 4 sessions over 5 days

  CTA: "Start Remediation" (accept)
  CTA: "Remind me later" (defer)
    ↓ Accept
[Blindspot Session — Camp Mode, targeted questions]
  Only Building Laws questions, weighted to problem topics
    ↓ Complete all sessions
[Blindspot Complete Screen]
  "Building Laws: 3 nodes moved from Red to Amber"
  Shows: before/after node comparison
  CTA: "Back to Camp Trail"
```

---

## Flow 5: Proof Simulation

```
[Camp Trail — near exam date]
  "Your Proof Run is ready. Take it when you're ready."
  CTA: "Start Proof Run"
    ↓
[Proof Simulation Setup Screen]
  Title: "The Proof Run"
  "This is the real exam — rehearsed.
   Same number of questions. Same time limit. No explanations."

  Duration: 4 hours
  Questions: 150 (or exam standard)
  Mode: Storm Mode (timed, no feedback)

  CTA: "I'm ready. Start."
  CTA: "Not today"
    ↓
[Full Simulation — Storm Mode interface]
  Timer: top bar progress (not countdown seconds)
  Can pause once for 10 min
  No answer feedback during session
    ↓ Complete
[Proof Run Results Screen]
  Score: 78
  "Under exam conditions. Same room. Same pressure."

  Breakdown by discipline (bar chart)
  Weakest: Site Planning (54%)
  Strongest: Building Laws (88%)

  Time analysis: "You averaged 92 sec/question. Exam allows 96 sec."

  CTA: "See Full Breakdown"
  CTA: "Back to Camp Trail"
```

---

## Error States Reference

| Error | Screen | Copy | Action |
|---|---|---|---|
| Network timeout | Any data screen | "Something went wrong. Your data is safe." | Retry button |
| Session save failed | Quiz completion | "Your session may not have saved. Check your score later." | Contact support link |
| Diagnostic incomplete | Score reveal | "Your orientation quiz isn't complete yet." | Resume quiz |
| Payment failed | Paywall | "Payment didn't go through. Try a different method." | Retry / different method |
| Score unavailable | Dashboard | "Score updating..." | Auto-refresh |
| Trail not generated | Trail screen | "Your trail is being built — check back in a minute." | Manual refresh |
| No questions in topic | Session start | "This topic doesn't have enough questions yet." | Suggest next topic |
