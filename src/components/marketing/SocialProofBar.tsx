import { Starburst } from '@/components/marketing/LandingPrimitives'

export const SocialProofBar = () => (
  <>
    <section className="border-y border-[#E8E4DC] bg-[#FFFDF7]/80 p-2">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center">
        <span className="text-[12px] font-medium text-[#6B6B6B]">
          Engineered by Topnotchers
        </span>
        <span className="text-[12px] text-[#9CA3AF]">&middot;</span>
        <span className="text-[12px] font-medium text-[#6B6B6B]">
          Content Verified by Licensed Architects
        </span>
        <span className="text-[12px] text-[#9CA3AF]">&middot;</span>
        <span className="text-[12px] font-medium text-[#6B6B6B]">
          500+ Architecture Students in the Camp
        </span>
      </div>
    </section>

    <section className="px-6">
      <div className="mx-auto my-2 flex max-w-[1200px] items-center gap-3">
        <Starburst className="h-4 w-4 text-[#F5A623]" />
        <h2
          id="how-it-works-heading"
          className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#6B6B6B]"
        >
          Students from these institutions are in the camp:
        </h2>
      </div>
    </section>
  </>
)
