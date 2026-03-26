import type { DesignScenario } from '@/lib/design-scenarios'

const DIFFICULTY_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  FOUNDATIONAL: { label: 'Foundational', color: '#2D9F6F', bg: '#EDFAF4' },
  INTERMEDIATE: { label: 'Intermediate', color: '#D4951A', bg: '#FEF8ED' },
  ADVANCED: { label: 'Advanced', color: '#D64545', bg: '#FDF0F0' },
}

type BriefPanelProps = {
  scenario: DesignScenario
}

const SiteDataRow = ({ label, value }: { label: string; value: string }) => (
  <div className='flex justify-between items-baseline py-1.5 border-b border-[#D4DAE3]/60 last:border-0 gap-2'>
    <span className='text-[11px] text-[#4A5568] shrink-0'>{label}</span>
    <span className='text-[11px] font-medium text-[#1A2332] font-mono text-right'>{value}</span>
  </div>
)

export const BriefPanel = ({ scenario }: BriefPanelProps) => {
  const style = DIFFICULTY_STYLES[scenario.difficulty] ?? {
    label: scenario.difficulty,
    color: '#4A5568',
    bg: '#F8F7F5',
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sd = scenario.site_data as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prog = scenario.program as any

  const siteRows: { label: string; value: string }[] = [
    { label: 'Lot Area', value: `${sd.total_lot_area_sqm} sqm` },
    { label: 'Shape', value: sd.lot_shape },
    { label: 'Frontage', value: `${sd.frontage_m} m` },
    { label: 'Depth', value: `${sd.depth_m} m` },
    { label: 'Zone', value: sd.zone },
    { label: 'PSO', value: `${sd.pso_percent}%` },
    { label: 'Bldg Height Limit', value: `${sd.building_height_limit_m} m` },
    ...(sd.flar_min !== undefined && sd.flar_max !== undefined
      ? [{ label: 'FLAR Range', value: `${sd.flar_min} – ${sd.flar_max}` }]
      : []),
    ...(sd.right_of_way_m !== undefined
      ? [{ label: 'Right-of-Way', value: `${sd.right_of_way_m} m (${sd.right_of_way_direction ?? ''})` }]
      : []),
    ...(sd.isa_percent !== undefined ? [{ label: 'ISA', value: `${sd.isa_percent}%` }] : []),
    ...(sd.usa_percent !== undefined ? [{ label: 'USA', value: `${sd.usa_percent}%` }] : []),
    ...(sd.slope_percent !== undefined
      ? [{ label: 'Slope', value: `${sd.slope_percent}% (${sd.slope_direction ?? ''})` }]
      : []),
    ...(sd.easements ? [{ label: 'Easements', value: sd.easements }] : []),
  ]

  return (
    <div className='flex flex-col gap-4'>
      {/* Title block */}
      <div className='rounded-md border border-[#D4DAE3] bg-white p-4 flex flex-col gap-2'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex-1 min-w-0'>
            <p className='text-[10px] text-[#8896A7] mb-1'>{scenario.building_type}</p>
            <h2 className='text-sm font-semibold text-[#1A2332] leading-snug'>{scenario.title}</h2>
          </div>
          <span
            className='shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-sm'
            style={{ color: style.color, background: style.bg }}
          >
            {style.label}
          </span>
        </div>
      </div>

      {/* Scenario brief */}
      <div className='rounded-md border border-[#D4DAE3] bg-white p-4 flex flex-col gap-2'>
        <h3 className='text-xs font-semibold text-[#1A2332] uppercase tracking-wide'>Scenario Brief</h3>
        <p className='text-xs text-[#4A5568] leading-relaxed'>{scenario.brief}</p>
      </div>

      {/* Site data */}
      <div className='rounded-md border border-[#D4DAE3] bg-white p-4 flex flex-col gap-1'>
        <h3 className='text-xs font-semibold text-[#1A2332] uppercase tracking-wide mb-1'>Site Data</h3>
        {siteRows.map((row) => (
          <SiteDataRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>

      {/* Program summary */}
      <div className='rounded-md border border-[#D4DAE3] bg-white p-4 flex flex-col gap-2'>
        <h3 className='text-xs font-semibold text-[#1A2332] uppercase tracking-wide'>Building Program</h3>
        <div className='flex flex-col gap-1'>
          <div className='flex justify-between items-baseline py-1 border-b border-[#D4DAE3]/60 gap-2'>
            <span className='text-[11px] text-[#4A5568]'>Occupancy</span>
            <span className='text-[11px] font-medium text-[#1A2332] text-right'>{prog.occupancy_type}</span>
          </div>
          <div className='flex justify-between items-baseline py-1 border-b border-[#D4DAE3]/60 gap-2'>
            <span className='text-[11px] text-[#4A5568]'>Stories</span>
            <span className='text-[11px] font-medium text-[#1A2332] font-mono'>{prog.building_stories}</span>
          </div>
        </div>
        {prog.zones.length > 0 && (
          <div className='flex flex-col gap-1.5 pt-1'>
            {prog.zones.map((zone) => (
              <div key={zone.name} className='flex flex-col gap-0.5'>
                <span className='text-[10px] font-medium text-[#8896A7] uppercase tracking-wide'>{zone.name}</span>
                <div className='flex flex-wrap gap-1'>
                  {zone.spaces.map((space) => (
                    <span
                      key={space}
                      className='text-[10px] px-1.5 py-0.5 rounded-sm bg-[#F8F7F5] text-[#4A5568]'
                      style={{ border: '1px solid #D4DAE3' }}
                    >
                      {space}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Code references */}
      {scenario.code_references.length > 0 && (
        <div className='rounded-md border border-[#D4DAE3] bg-white p-4 flex flex-col gap-2'>
          <h3 className='text-xs font-semibold text-[#1A2332] uppercase tracking-wide'>Code References</h3>
          <div className='flex flex-wrap gap-1.5'>
            {scenario.code_references.map((ref) => (
              <span
                key={ref}
                className='text-[10px] font-medium px-2 py-0.5 rounded-sm bg-[#EEF2FC] text-[#1B3FC4]'
              >
                {ref}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
