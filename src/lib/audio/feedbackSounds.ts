// Web Audio API — zero asset fetch, synthesized at runtime.
// Correct-answer feedback stays intentionally brief and quiet.

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

type BrowserAudioContextConstructor = typeof AudioContext
type BrowserWindowWithAudioContext = Window & {
  AudioContext?: BrowserAudioContextConstructor
  webkitAudioContext?: BrowserAudioContextConstructor
}

let audioContext: AudioContext | null = null

const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return true
  if (typeof window.matchMedia !== 'function') return false

  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

const getContext = (): AudioContext | null => {
  const browserWindow = window as BrowserWindowWithAudioContext
  const AudioContextConstructor = browserWindow.AudioContext ?? browserWindow.webkitAudioContext

  if (!AudioContextConstructor) return null

  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContextConstructor()
  }

  return audioContext
}

const playTone = ({
  frequency,
  startTime,
  duration = 0.28,
  volume = 0.12,
}: {
  frequency: number
  startTime: number
  duration?: number
  volume?: number
}) => {
  const ctx = getContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => undefined)
  }

  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, startTime)
  gain.gain.setValueAtTime(volume, startTime)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

export function playCorrectSound(): void {
  if (typeof window === 'undefined') return
  if (prefersReducedMotion()) return

  try {
    const ctx = getContext()
    if (!ctx) return

    playTone({ frequency: 880, startTime: ctx.currentTime, duration: 0.3, volume: 0.15 })
  } catch {
    // Audio feedback is decorative; never block answer submission.
  }
}

export function playCompletionSound(): void {
  if (typeof window === 'undefined') return
  if (prefersReducedMotion()) return

  try {
    const ctx = getContext()
    if (!ctx) return

    ;[523.25, 659.25].forEach((frequency, index) => {
      playTone({ frequency, startTime: ctx.currentTime + index * 0.15, duration: 0.3, volume: 0.12 })
    })
  } catch {
    // Audio feedback is decorative; never block the completed action.
  }
}

// No incorrect-answer sound: silence is the feedback.
