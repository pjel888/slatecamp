import Link from 'next/link'
import {
  FeatureSectionLayout,
  FeatureCheckItem,
  SectionEyebrow,
  FeaturePill,
} from '@/components/marketing/FeatureSectionLayout'
import { palette, cssVars } from '@/components/graphics/tokens'
import { StaggerParent, StaggerItem } from '@/components/motion/StaggerChildren'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { ROUTES } from '@/lib/constants'

const ThreeDMockup = () => (
  <div className='relative overflow-hidden rounded-[22px] border border-white/10 bg-camp-black shadow-[0_24px_60px_rgba(0,0,0,0.35)]'>
    <div className='absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(126,179,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(126,179,255,0.08)_1px,transparent_1px)] [background-size:24px_24px]' />
    <div className='relative z-10'>
      <div className='flex items-center justify-between border-b border-white/10 px-4 py-3'>
        <div>
          <span className='inline-block rounded-full bg-white/10 px-2.5 py-0.5 font-[family-name:var(--font-dm-mono)] text-[11px] text-white/70'>
            3D Lab · Setback Explorer
          </span>
          <div className='mt-1 text-[13px] font-bold text-white'>Lot, setbacks, eave clearance</div>
        </div>
        <span className='rounded-full bg-camp-amber/15 px-2.5 py-0.5 font-[family-name:var(--font-dm-mono)] text-[11px] text-camp-amber'>
          Preview
        </span>
      </div>

      <div className='flex items-center justify-center px-3 py-5'>
        <svg viewBox='0 0 340 210' className='w-full max-w-[360px]' role='img' aria-label='Blueprint style setback preview'>
          <defs>
            <pattern id='labHatch' width='7' height='7' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'>
              <line x1='0' y1='0' x2='0' y2='7' stroke='rgba(245,166,35,0.18)' strokeWidth='0.75' />
            </pattern>
          </defs>
          <rect x='18' y='18' width='300' height='160' fill='rgba(74,120,255,0.04)' stroke='rgba(150,200,255,0.28)' strokeDasharray='6 4' />
          <rect x='18' y='18' width='300' height='28' fill='rgba(245,166,35,0.09)' />
          <rect x='18' y='148' width='300' height='30' fill='rgba(245,166,35,0.07)' />
          <rect x='18' y='18' width='30' height='160' fill='rgba(245,166,35,0.08)' />
          <rect x='288' y='18' width='30' height='160' fill='rgba(245,166,35,0.08)' />
          <rect x='48' y='46' width='240' height='102' rx='5' fill='url(#labHatch)' stroke={palette.amber} strokeWidth='1.25' />
          <polygon points='94,88 170,54 246,88 170,126' fill='rgba(110,168,255,0.16)' stroke='rgba(150,200,255,0.62)' />
          <polygon points='118,90 172,68 224,92 170,116' fill='rgba(110,168,255,0.86)' />
          <polygon points='118,90 170,116 170,144 118,116' fill='rgba(27,63,196,0.86)' />
          <polygon points='170,116 224,92 224,120 170,144' fill='rgba(16,45,119,0.95)' />
          <polygon points='104,84 172,58 238,86 170,122' fill='rgba(245,166,35,0.94)' />
          <line x1='238' y1='86' x2='300' y2='56' stroke='#A7F3D0' strokeDasharray='4 4' />
          <text x='238' y='35' fill='#A7F3D0' fontSize='9' fontFamily='monospace'>750 mm clear zone</text>
          <text x='170' y='166' textAnchor='middle' fill='rgba(245,166,35,0.74)' fontSize='10' fontFamily='monospace'>SETBACK BANDS + BUILDABLE ENVELOPE</text>
        </svg>
      </div>

      <div className='grid grid-cols-3 gap-px border-t border-white/10 bg-white/10 text-center'>
        {['Isometric', 'Plan', 'Section'].map((view, index) => (
          <div key={view} className={`px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[10px] ${index === 0 ? 'bg-camp-amber/15 text-camp-amber' : 'bg-black/20 text-white/60'}`}>
            {view}
          </div>
        ))}
      </div>
    </div>
  </div>
)

export const ThreeDLabSection = () => (
  <div id='three-d-lab-preview' className='scroll-mt-24'>
    <FeatureSectionLayout dark flip>
      <StaggerParent>
        <StaggerItem>
          <SectionEyebrow label='3D Lab' dark />
        </StaggerItem>

        <StaggerItem>
          <h2 className='font-[family-name:var(--font-syne)] text-[28px] font-extrabold leading-[1.15] text-white sm:text-[34px]'>
            Setbacks are easier to understand when the lot shrinks in front of you.
          </h2>
        </StaggerItem>

        <StaggerItem>
          <p className='mt-4 max-w-[460px] text-[14px] leading-relaxed text-white/70'>
            The 3D Lab is SlateCamp’s signature proof: spatial code topics made visible for students who cannot rely on flat tables alone. Preview the idea here, then use the full lab after signup as modules are released.
          </p>
        </StaggerItem>

        <StaggerItem>
          <div className='mt-5 flex flex-wrap gap-2'>
            <FeaturePill variant='muted-dark'>Setback envelope</FeaturePill>
            <FeaturePill variant='amber'>Eave clearance</FeaturePill>
            <FeaturePill variant='muted-dark'>Plan + isometric views</FeaturePill>
            <FeaturePill variant='muted-dark'>Educational source guard</FeaturePill>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className='mt-8 space-y-5'>
            <FeatureCheckItem
              title='Turn code into a visible shape'
              description='A lot, property line, setback band, and buildable envelope become easier to remember when the geometry is visible.'
              accentColor={cssVars.accent}
              textDark
            />
            <FeatureCheckItem
              title='Use it with primary documents'
              description='The lab is an educational visual companion. Verify current requirements with primary code documents, local ordinances, and a qualified professional.'
              accentColor={cssVars.accent}
              textDark
            />
          </div>
          <Link
            href={ROUTES.auth.register}
            className='mt-7 inline-flex rounded-sm bg-camp-amber px-5 py-2.5 text-[13px] font-semibold text-camp-black transition hover:bg-warning-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camp-amber/40'
          >
            Create a free account for the full lab
          </Link>
        </StaggerItem>
      </StaggerParent>

      <ScrollReveal delay={0.15} y={0}>
        <ThreeDMockup />
      </ScrollReveal>
    </FeatureSectionLayout>
  </div>
)
