'use client'

import {
  FeatureSectionLayout,
  FeatureCheckItem,
  SectionEyebrow,
  FeaturePill,
} from '@/components/marketing/FeatureSectionLayout'
import { StaggerParent, StaggerItem } from '@/components/motion/StaggerChildren'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

/* ── 3D viewer mockup ── */

const ThreeDMockup = () => (
  <div className='relative overflow-hidden rounded-[10px] bg-[#0D1B3E]'>
    <div className='relative z-10'>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-white/10 px-4 py-3'>
        <div>
          <span className='inline-block rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[11px] text-white/55'>
            3D Lab · Site Plan
          </span>
          <div className='mt-1 text-[13px] font-bold text-white'>Residential — Corner Lot</div>
        </div>
        <span className='rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[11px] text-white/55'>
          Blueprint
        </span>
      </div>

      {/* Blueprint SVG — orthographic corner lot site plan */}
      <div className='flex items-center justify-center px-3 py-2'>
        <svg
          viewBox='0 0 320 158'
          className='w-full max-w-[320px]'
          aria-label='Corner lot site plan blueprint'
        >
          <defs>
            <pattern
              id='bpHatch'
              width='6'
              height='6'
              patternUnits='userSpaceOnUse'
              patternTransform='rotate(45)'
            >
              <line x1='0' y1='0' x2='0' y2='6' stroke='rgba(126,179,255,0.1)' strokeWidth='0.75' />
            </pattern>
          </defs>

          {/* Subtle blueprint grid */}
          {[40,60,80,100,120,140,160,180,200,220,240,260,280,300].map((x) => (
            <line key={`vg${x}`} x1={x} y1='0' x2={x} y2='158' stroke='rgba(100,150,255,0.055)' strokeWidth='0.5' />
          ))}
          {[20,40,60,80,100,120,140].map((y) => (
            <line key={`hg${y}`} x1='0' y1={y} x2='320' y2={y} stroke='rgba(100,150,255,0.055)' strokeWidth='0.5' />
          ))}

          {/* Street A — top (main street, horizontal) */}
          <rect x='0' y='0' width='320' height='18' fill='rgba(20,50,120,0.65)' />
          <line x1='0' y1='9' x2='320' y2='9' stroke='rgba(255,200,70,0.28)' strokeWidth='0.75' strokeDasharray='10 5' />
          <text x='185' y='13' fill='rgba(150,200,255,0.4)' fontSize='7' fontFamily='monospace' letterSpacing='0.1em'>MAIN STREET</text>

          {/* Street B — left (side street, vertical) */}
          <rect x='0' y='0' width='18' height='158' fill='rgba(20,50,120,0.65)' />
          <line x1='9' y1='18' x2='9' y2='158' stroke='rgba(255,200,70,0.28)' strokeWidth='0.75' strokeDasharray='10 5' />
          <text x='9' y='100' fill='rgba(150,200,255,0.4)' fontSize='7' fontFamily='monospace' letterSpacing='0.1em' textAnchor='middle' transform='rotate(-90 9 100)'>SIDE ST.</text>

          {/* Lot boundary */}
          <rect x='18' y='18' width='287' height='130' fill='none' stroke='rgba(150,200,255,0.28)' strokeWidth='0.75' strokeDasharray='5 3' />

          {/* Setback zone tints (amber wash on front + corner) */}
          <rect x='18' y='18' width='287' height='22' fill='rgba(245,166,35,0.055)' />
          <rect x='18' y='18' width='18' height='130' fill='rgba(245,166,35,0.055)' />

          {/* Building footprint — hatch + blue fill */}
          <rect x='36' y='40' width='250' height='88' fill='url(#bpHatch)' />
          <rect x='36' y='40' width='250' height='88' fill='rgba(74,120,255,0.11)' stroke='#7EB3FF' strokeWidth='1.5' />

          {/* Building label */}
          <text x='161' y='82' textAnchor='middle' fill='rgba(150,200,255,0.38)' fontSize='9' fontFamily='monospace'>BUILDING</text>
          <text x='161' y='94' textAnchor='middle' fill='rgba(150,200,255,0.2)' fontSize='7' fontFamily='monospace'>FOOTPRINT</text>

          {/* Dim: Front setback — vertical, centered at x=158, y=18→40 */}
          <line x1='158' y1='18' x2='158' y2='40' stroke='#F5A623' strokeWidth='0.75' />
          <line x1='155' y1='21' x2='158' y2='18' stroke='#F5A623' strokeWidth='0.75' />
          <line x1='161' y1='21' x2='158' y2='18' stroke='#F5A623' strokeWidth='0.75' />
          <line x1='155' y1='37' x2='158' y2='40' stroke='#F5A623' strokeWidth='0.75' />
          <line x1='161' y1='37' x2='158' y2='40' stroke='#F5A623' strokeWidth='0.75' />
          <text x='163' y='32' fill='#F5A623' fontSize='8' fontFamily='monospace'>3.0m</text>

          {/* Dim: Corner setback — horizontal, at y=80, x=18→36, label rotated */}
          <line x1='18' y1='80' x2='36' y2='80' stroke='#F5A623' strokeWidth='0.75' />
          <line x1='21' y1='77' x2='18' y2='80' stroke='#F5A623' strokeWidth='0.75' />
          <line x1='21' y1='83' x2='18' y2='80' stroke='#F5A623' strokeWidth='0.75' />
          <line x1='33' y1='77' x2='36' y2='80' stroke='#F5A623' strokeWidth='0.75' />
          <line x1='33' y1='83' x2='36' y2='80' stroke='#F5A623' strokeWidth='0.75' />
          <text x='27' y='80' textAnchor='middle' fill='#F5A623' fontSize='7' fontFamily='monospace' transform='rotate(-90 27 80)'>2.0m</text>

          {/* Corner lot marker — amber triangle at street intersection */}
          <polygon points='18,18 32,18 18,32' fill='rgba(245,166,35,0.22)' stroke='rgba(245,166,35,0.38)' strokeWidth='0.5' />

          {/* North arrow — bottom-right of lot, in rear/side setback area */}
          <g transform='translate(296, 138)'>
            <circle cx='0' cy='0' r='9' fill='none' stroke='rgba(150,200,255,0.18)' strokeWidth='0.75' />
            <line x1='0' y1='6' x2='0' y2='-6' stroke='rgba(150,200,255,0.45)' strokeWidth='0.75' />
            <polygon points='0,-6 -2.5,-1 2.5,-1' fill='rgba(150,200,255,0.6)' />
            <text x='0' y='4' textAnchor='middle' fill='rgba(150,200,255,0.45)' fontSize='6' fontFamily='monospace'>N</text>
          </g>
        </svg>
      </div>

      {/* Footer: Blueprint legend */}
      <div className='flex items-center gap-5 border-t border-white/10 px-4 py-2.5'>
        <div className='flex items-center gap-1.5'>
          <div className='h-2.5 w-4 rounded-[2px] border border-[#7EB3FF] bg-[rgba(74,120,255,0.11)]' />
          <span className='font-mono text-[10px] text-white/30'>Building</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <div className='h-px w-4 bg-[#F5A623]' />
          <span className='font-mono text-[10px] text-white/30'>Setback</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <svg width='16' height='4' viewBox='0 0 16 4' aria-hidden='true'>
            <line x1='0' y1='2' x2='16' y2='2' stroke='rgba(150,200,255,0.28)' strokeWidth='1' strokeDasharray='4 2' />
          </svg>
          <span className='font-mono text-[10px] text-white/30'>Lot line</span>
        </div>
        <span className='ml-auto font-mono text-[10px] text-white/18'>NTS</span>
      </div>
    </div>
  </div>
)

/* ── 3D Lab Section ── */

export const ThreeDLabSection = () => (
  <FeatureSectionLayout dark flip>
    {/* Copy — left (visually right due to flip) */}
    <StaggerParent>
      <StaggerItem>
        <SectionEyebrow label='3D Lab' dark />
      </StaggerItem>

      <StaggerItem>
        <h2 className='font-[family-name:var(--font-syne)] text-[28px] font-extrabold leading-[1.15] tracking-tight text-white sm:text-[34px]'>
          Some things you can&apos;t learn
          <br />
          from a textbook.
        </h2>
      </StaggerItem>

      <StaggerItem>
        <p className='mt-4 max-w-[440px] text-[14px] leading-relaxed text-white/55'>
          Architecture is spatial. Flat pages can&apos;t teach you how a building
          actually comes together. The 3D Lab lets you rotate, cut away, and
          explore structures — so concepts click the way they&apos;re supposed to.
        </p>
      </StaggerItem>

      {/* Feature chips */}
      <StaggerItem>
        <div className='mt-5 flex flex-wrap gap-2'>
          <FeaturePill variant='muted-dark'>Interactive models</FeaturePill>
          <FeaturePill variant='amber'>Rotate &amp; explore</FeaturePill>
          <FeaturePill variant='muted-dark'>Cut-away sections</FeaturePill>
          <FeaturePill variant='muted-dark'>Linked to study content</FeaturePill>
        </div>
      </StaggerItem>

      {/* Check items */}
      <StaggerItem>
        <div className='mt-8 space-y-5'>
          <FeatureCheckItem
            title='Learn by seeing, not just reading'
            description='Structural systems, building assemblies, and spatial relationships — explored in three dimensions, not described in two.'
            accentColor='#F5A623'
            textDark
          />
          <FeatureCheckItem
            title='Connected to what you&apos;re studying'
            description='3D models link directly to your notes and quiz content, so context is never more than a click away.'
            accentColor='#F5A623'
            textDark
          />
        </div>
      </StaggerItem>
    </StaggerParent>

    {/* Mockup — right (visually left due to flip) */}
    <ScrollReveal delay={0.15} y={0}>
      <ThreeDMockup />
    </ScrollReveal>
  </FeatureSectionLayout>
)
