import type { DesignScenario } from '@/lib/design-scenarios'

const DIFFICULTY_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  FOUNDATIONAL: { label: 'Foundational', color: 'var(--success)', bg: 'var(--success-50)' },
  INTERMEDIATE: { label: 'Intermediate', color: 'var(--warning)', bg: 'var(--warning-50)' },
  ADVANCED: { label: 'Advanced', color: 'var(--destructive)', bg: 'var(--destructive-50)' },
}

type BriefPanelProps = {
  scenario: DesignScenario
}

const SiteDataRow = ({ label, value }: { label: string; value: string }) => (
  <div className='flex justify-between items-baseline py-1.5 border-b border-border/60 last:border-0 gap-2'>
    <span className='text-[11px] text-muted-foreground shrink-0'>{label}</span>
    <span className='text-[11px] font-medium text-foreground font-mono text-right'>{value}</span>
  </div>
)

export const BriefPanel = ({ scenario }: BriefPanelProps) => {
  const style = DIFFICULTY_STYLES[scenario.difficulty] ?? {
    label: scenario.difficulty,
    color: 'var(--muted-foreground)',
    bg: 'var(--background)',
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sd = scenario.site_data as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prog = scenario.program as any

  const siteRows: { label: string; value: string }[] = [
    ...(sd.total_lot_area_sqm ? [{ label: 'Lot Area', value: `${sd.total_lot_area_sqm} sqm` }] : []),
    ...(sd.lot_shape ? [{ label: 'Shape', value: sd.lot_shape }] : []),
    ...(sd.frontage_m ? [{ label: 'Frontage', value: `${sd.frontage_m} m` }] : []),
    ...(sd.depth_m ? [{ label: 'Depth', value: `${sd.depth_m} m` }] : []),
    ...(sd.zone ? [{ label: 'Zone', value: sd.zone }] : []),
    ...(sd.pso_percent ? [{ label: 'PSO', value: `${sd.pso_percent}%` }] : []),
    ...(sd.building_height_limit_m ? [{ label: 'Bldg Height Limit', value: `${sd.building_height_limit_m} m` }] : []),
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
      <div className='rounded-md border border-border bg-card p-4 flex flex-col gap-2'>
        <div className='items-start justify-between gap-2 hidden sm:flex'>
          <div className='flex-1 min-w-0'>
            <p className='text-[10px] text-muted-foreground mb-1'>{scenario.building_type}</p>
            <h2 className='text-sm font-semibold text-foreground leading-snug'>{scenario.title}</h2>
          </div>
          <span
            className='shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-sm'
            style={{ color: style.color, background: style.bg }}
          >
            {style.label}
          </span>
        </div>
        {/* Mobile title view */}
        <div className='flex flex-col gap-1 sm:hidden'>
          <div className='flex items-center justify-between'>
            <p className='text-[10px] text-muted-foreground'>{scenario.building_type}</p>
            <span
              className='shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-sm'
              style={{ color: style.color, background: style.bg }}
            >
              {style.label}
            </span>
          </div>
          <h2 className='text-sm font-semibold text-foreground leading-snug'>{scenario.title}</h2>
        </div>
      </div>

      {/* Scenario brief */}
      {scenario.brief && (
        <div className='rounded-md border border-border bg-card p-4 flex flex-col gap-2'>
          <h3 className='text-xs font-semibold text-foreground uppercase tracking-wide'>Scenario Brief</h3>
          <p className='text-xs text-muted-foreground leading-relaxed'>{scenario.brief}</p>
        </div>
      )}

      {/* Site data */}
      {siteRows.length > 0 && (
        <div className='rounded-md border border-border bg-card p-4 flex flex-col gap-1'>
          <h3 className='text-xs font-semibold text-foreground uppercase tracking-wide mb-1'>Site Data</h3>
          {siteRows.map((row) => (
            <SiteDataRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      )}

      {/* Program summary */}
      <div className='rounded-md border border-border bg-card p-4 flex flex-col gap-2'>
        <h3 className='text-xs font-semibold text-foreground uppercase tracking-wide'>Building Program</h3>
        <div className='flex flex-col gap-1'>
          {prog.occupancy_type && (
            <div className='flex justify-between items-baseline py-1 border-b border-border/60 gap-2'>
              <span className='text-[11px] text-muted-foreground'>Occupancy</span>
              <span className='text-[11px] font-medium text-foreground text-right'>{prog.occupancy_type}</span>
            </div>
          )}
          {prog.building_stories && (
            <div className='flex justify-between items-baseline py-1 border-b border-border/60 gap-2'>
              <span className='text-[11px] text-muted-foreground'>Stories</span>
              <span className='text-[11px] font-medium text-foreground font-mono'>{prog.building_stories}</span>
            </div>
          )}
          {prog.total_units && (
            <div className='flex justify-between items-baseline py-1 border-b border-border/60 gap-2'>
              <span className='text-[11px] text-muted-foreground'>Total Units</span>
              <span className='text-[11px] font-medium text-foreground font-mono'>{prog.total_units}</span>
            </div>
          )}
        </div>

        {prog.zones && prog.zones.length > 0 && (
          <div className='flex flex-col gap-1.5 pt-1'>
            {prog.zones.map((zone: any) => (
              <div key={zone.name} className='flex flex-col gap-0.5'>
                <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-wide'>{zone.name}</span>
                <div className='flex flex-wrap gap-1'>
                  {zone.spaces?.map((space: string) => (
                    <span
                      key={space}
                      className='text-[10px] px-1.5 py-0.5 rounded-sm bg-background text-muted-foreground border border-border'
                    >
                      {space}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fallback for other program structures */}
        {(!prog.zones || prog.zones.length === 0) && prog.ground_floor_uses && (
           <div className='flex flex-col gap-1.5 pt-1'>
              <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-wide'>Ground Floor Uses</span>
              <div className='flex flex-wrap gap-1'>
                {prog.ground_floor_uses.map((use: string) => (
                  <span key={use} className='text-[10px] px-1.5 py-0.5 rounded-sm bg-background text-muted-foreground border border-border'>{use}</span>
                ))}
              </div>
           </div>
        )}
      </div>

      {/* Code references */}
      {scenario.code_references.length > 0 && (
        <div className='rounded-md border border-border bg-card p-4 flex flex-col gap-2'>
          <h3 className='text-xs font-semibold text-foreground uppercase tracking-wide'>Code References</h3>
          <div className='flex flex-wrap gap-1.5'>
            {scenario.code_references.map((ref) => (
              <span
                key={ref}
                className='text-[10px] font-medium px-2 py-0.5 rounded-sm bg-primary-50 text-primary'
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
