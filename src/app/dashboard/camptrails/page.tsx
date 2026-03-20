import { Path } from '@phosphor-icons/react/dist/ssr'

const CampTrailsPage = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="flex max-w-sm flex-col items-center text-center">
        {/* Icon circle */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2FC]">
          <Path size={28} weight="duotone" className="text-[#1B3FC4]" />
        </div>

        {/* Heading */}
        <h1 className="mt-5 text-xl font-bold text-[#1A2332]">CampTrails</h1>

        {/* Coming Soon badge */}
        <span className="mt-2 rounded-md bg-zinc-500/10 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500">
          Coming Soon
        </span>

        {/* Description */}
        <p className="mt-4 text-sm leading-relaxed text-[#4A5568]">
          Curated learning paths that guide you through topics step by step
          &mdash; so you always know what to study next.
        </p>
      </div>
    </div>
  )
}

export default CampTrailsPage
