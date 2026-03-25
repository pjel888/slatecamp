'use client'

import * as React from 'react'

const ITEMS = [
  { q: '⟳ Min clear door opening width (2024 IRR)?', a: '900 mm', src: 'C.2.1' },
  { q: '⟳ Clear level space required before and beyond a door (2024)?', a: '1,800 × 1,800 mm', src: 'C.2.6' },
  { q: '⟳ Door closer maximum force (interior, 2024)?', a: '2.0 kg', src: 'C.2.4' },
  { q: '⟳ Threshold maximum height (2024)?', a: '12 mm', src: 'C.3.1' },
  { q: 'At what threshold height is beveling required? At what gradient?', a: 'Above 6 mm; gradient 1:8', src: 'C.3.1' },
  { q: '⟳ Secondary peephole height (2024)?', a: '1,000 mm', src: 'C.2.14' },
  { q: '⟳ Switch height range (2024)?', a: '900–1,200 mm', src: 'C.4.1' },
  { q: '⟳ Corridor minimum width — single wheelchair + ambulant (2024)?', a: '1,500 mm', src: 'C.5.1' },
  { q: 'Corridor minimum width — two wheelchairs passing?', a: '1,800 mm', src: 'C.5.2' },
  { q: '⟳ Corridor turnabout dimensions (2024)?', a: '1,800 × 1,800 mm', src: 'C.5.2' },
  { q: 'Maximum spacing between corridor turnabouts?', a: '12,000 mm (12 m)', src: 'C.5.2' },
  { q: 'Distance to turnabout from a dead-end corridor?', a: 'At or within 3,500 mm', src: 'C.5.3' },
  { q: '⟳ Toilet cubicle minimum dimensions (2024)?', a: '1,800 × 1,800 mm (square)', src: 'C.6.3.a' },
  { q: '⟳ Turning space required outside a toilet cubicle (2024)?', a: '1,800 × 1,800 mm', src: 'C.6.3.i' },
  { q: 'WC seat height above finished floor?', a: '450 mm', src: 'C.6.7' },
  { q: '⟳ WC centerline from the finished face of the side wall (2024)?', a: '450 mm', src: 'C.6.3.d' },
  { q: '⟳ Grab bar outer face to wall distance (2024)?', a: '100 mm', src: 'C.6.3.c' },
  { q: 'Grab bar face to WC centerline distance?', a: '350 mm', src: 'C.6.3.c' },
  { q: '⟳ Grab bar height above toilet seat (2024 — exact value)?', a: '300 mm', src: 'C.6.3.b' },
  { q: '⟳ Grab bar cross-section diameter range (2024)?', a: '30–40 mm', src: 'A.5.6' },
  { q: 'Minimum wall clearance for grab bars?', a: '50 mm', src: 'A.5.7' },
  { q: 'Minimum flip-up grab bar load capacity?', a: '200 kg', src: 'C.6.3.b' },
  { q: 'Lavatory centerline from adjacent wall?', a: '450 mm', src: 'C.6.9' },
  { q: 'Lavatory rim mounting height?', a: '800 mm', src: 'C.6.9' },
  { q: 'Lavatory minimum vertical knee clearance?', a: '650 mm', src: 'C.6.9' },
  { q: '⟳ Urinal maximum lip height (2024)?', a: '350–400 mm', src: 'C.6.12' },
  { q: '⟳ Urinal clear floor space (2024)?', a: '900 × 900 mm', src: 'C.6.12' },
  { q: 'Urinal grab bar top edge height?', a: '1,500 mm above floor', src: 'C.6.12' },
  { q: '⟳ Roll-in shower dimensions (2024)?', a: '1,800 × 1,800 mm', src: 'C.6.22' },
  { q: '⟳ Roll-in shower maximum curb height (2024)?', a: '12 mm', src: 'C.6.22' },
  { q: 'Emergency call button height range in accessible toilet?', a: '400–600 mm from finished floor', src: 'C.6.18' },
  { q: 'Horizontal pull bar height on toilet door?', a: '900 mm', src: 'C.6.17' },
  { q: 'Why must an accessible toilet door swing outward?', a: 'So a rescuer can open the door if a person has fallen behind it', src: 'C.6.14' },
  { q: '⟳ Accessible toilet door signage size (2024)?', a: '200 × 200 mm', src: 'A.7.7' },
  { q: '⟳ Wall/door signage maximum mounting height — to center of sign (2024)?', a: '1,500 mm', src: 'A.7.6' },
  { q: 'ISA symbol colors?', a: 'White symbols on UN Blue (#5B92E5) background', src: 'A.7.1' },
  { q: '⟳ Vestibule level area (2024)?', a: '1,800 mm depth × 1,800 mm width', src: 'C.1.4' },
  { q: 'What hardware type is NOT permitted on accessible routes?', a: 'Knob-type hardware', src: 'C.2.10' },
  { q: 'How many accessible toilets are required when a floor has 20 or fewer WCs?', a: 'At least 1 accessible female + 1 accessible male cubicle', src: 'C.6.2' },
  { q: 'What toilet seat shape is explicitly prohibited by the 2024 IRR?', a: 'Horseshoe-shaped seats', src: 'C.6.3.h' },
]

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const RecallDrill = () => {
  const [deck, setDeck] = React.useState(() => shuffle(ITEMS))
  const [idx, setIdx] = React.useState(0)
  const [revealed, setRevealed] = React.useState(false)
  const cur = deck[idx]

  const next = () => {
    const ni = idx + 1
    if (ni >= deck.length) {
      setDeck(shuffle(ITEMS))
      setIdx(0)
    } else {
      setIdx(ni)
    }
    setRevealed(false)
  }

  return (
    <div className="not-prose my-5 rounded-lg border border-[#d0cec7] bg-[#F5F5F5] px-6 py-5">
      <div className="font-dm-mono text-[11px] uppercase tracking-[0.08em] text-[camp-cobalt] mb-2">Interactive — Recall Drill (2024 IRR)</div>
      <p className="text-[13px] text-[#444] mb-3.5">Questions marked ⟳ test a value that changed in 2024 — common ALE traps. Hit <strong>Reveal</strong> then <strong>Next</strong>.</p>
      <div className="bg-white border-[1.5px] border-[#d0cec7] rounded-md px-4 py-4 min-h-[80px] mb-3">
        <div className="text-[14px] text-[#1a1a1a] font-medium mb-1.5">{cur.q}</div>
        <div className="font-dm-mono text-[11px] text-[#888]">BP 344 2024 IRR — {cur.src}</div>
        {revealed && (
          <div className="mt-3 px-3.5 py-2.5 rounded-md bg-[#e8f5ee] border border-[#1B7A3C]">
            <span className="font-dm-mono text-[14px] text-[#1B7A3C] font-semibold">{cur.a}</span>
          </div>
        )}
      </div>
      <div className="flex gap-2.5 items-center flex-wrap">
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="px-5 py-2 bg-[camp-cobalt] text-white border-none rounded-md text-[13px] cursor-pointer font-sans hover:bg-[#1535A8] transition-colors duration-150"
          >
            Reveal
          </button>
        ) : (
          <button
            onClick={next}
            className="px-5 py-2 bg-white text-[camp-cobalt] border-[1.5px] border-[camp-cobalt] rounded-md text-[13px] cursor-pointer font-sans hover:bg-[#EEF2FC] transition-colors duration-150"
          >
            Next →
          </button>
        )}
        <span className="font-dm-mono text-[11px] text-[#888]">{idx + 1} / {deck.length}</span>
      </div>
    </div>
  )
}
