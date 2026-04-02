<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# audio

## Purpose

The `audio` directory provides simple audio feedback utilities using the Web Audio API: synthesized tones for correct answer confirmation and session completion. Zero bundle size (runtime synthesis), respects `prefers-reduced-motion` for accessibility.

## Key Files

| File | Description |
|------|-------------|
| `feedbackSounds.ts` | Web Audio API synthesis: `playCorrectSound()` (A5 sine, 880 Hz, 300ms), `playCompletionSound()` (two-note chime) |

## For AI Agents

### Working In This Directory

**Audio Feedback Philosophy:**
- NO incorrect answer sound (silence IS the feedback).
- Correct answer: single ascending tone (A5, 880 Hz, 300ms) → positive reinforcement.
- Session completion: two-note chime (C5 523Hz + E5 659Hz, staggered start) → celebratory.
- Zero incorrect/error sound: negative audio feedback can increase anxiety and reduce retention.

**Web Audio API:**
- No npm dependencies; uses browser's native AudioContext.
- Sine wave oscillator (smooth tone).
- Gain envelope with exponential ramp (natural fade-out).
- Safe for client-side: checks `typeof window` to avoid SSR errors.

**Accessibility (CRITICAL):**
- Always respect `prefers-reduced-motion: reduce` media query.
- Users with motion sensitivity or vestibular disorders will have this set.
- Check before playing any audio.
- No auto-play; only trigger on user interaction (answer submission).

### Common Patterns

**Playing Correct Sound:**
```typescript
'use client'

import { playCorrectSound } from '@/lib/audio'

const handleCorrectAnswer = () => {
  playCorrectSound() // Safe to call; checks window and prefers-reduced-motion
}
```

**Playing Completion Sound:**
```typescript
'use client'

import { playCompletionSound } from '@/lib/audio'

const handleSessionComplete = () => {
  playCompletionSound() // Two-note chime
}
```

**In a Quiz Component:**
```typescript
'use client'

import { playCorrectSound } from '@/lib/audio'
import { trackEvent } from '@/lib/analytics'

const QuestionCard = ({ question, onAnswer }) => {
  const handleSubmit = async (selectedOption) => {
    const isCorrect = selectedOption === question.correctAnswer
    
    if (isCorrect) {
      playCorrectSound()
      trackEvent('correct_answer', { questionId: question.id })
    } else {
      trackEvent('incorrect_answer', { questionId: question.id })
    }
    
    onAnswer(isCorrect)
  }
  
  return (...)
}
```

## Dependencies

### Internal

- **Analytics:** `trackEvent()` optional for logging audio playback (can be fire-and-forget).

### External

- **Web Audio API:** Native browser API (no npm dependencies).
- **AudioContext:** Available in all modern browsers.

---

**Last Updated:** 2026-04-02

**For accessibility guidelines, consult WCAG 2.1 and `.claude/agents/` in the repository root.**
