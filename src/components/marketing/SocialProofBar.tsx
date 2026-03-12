import { Starburst } from '@/components/marketing/LandingPrimitives'
import { SLATECAMP_INK, SLATECAMP_BORDER, SLATECAMP_PAPER, SLATECAMP_AMBER, hexToRgba } from '@/lib/constants'

export const SocialProofBar = () => (
  <>
    <section
      className="border-y p-2"
      style={{ borderColor: SLATECAMP_BORDER.DEFAULT, backgroundColor: hexToRgba(SLATECAMP_PAPER.snow, 0.6) }}
    >
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center">
        <span className="text-[12px] font-medium" style={{ color: SLATECAMP_INK.muted }}>Engineered by Topnotchers</span>
        <span className="text-[12px]" style={{ color: SLATECAMP_INK.subtle }}>&middot;</span>
        <span className="text-[12px] font-medium" style={{ color: SLATECAMP_INK.muted }}>SME-Verified Content</span>
        <span className="text-[12px]" style={{ color: SLATECAMP_INK.subtle }}>&middot;</span>
        <span className="text-[12px] font-medium" style={{ color: SLATECAMP_INK.muted }}>Used by 500+ Architecture Students</span>
      </div>
    </section>

    <section className="px-6">
      <div className="mx-auto my-2 flex max-w-[1200px] items-center gap-3">
        <Starburst className="h-4 w-4" style={{ color: SLATECAMP_AMBER.DEFAULT }} />
        <h2 id="how-it-works-heading" className="font-mono text-[8px] tracking-[0.2em] uppercase" style={{ color: SLATECAMP_INK.subtle }}>
          TRUSTED BY STUDENTS AND PROFESSIONALS AT:
        </h2>
      </div>
    </section>
  </>
)
