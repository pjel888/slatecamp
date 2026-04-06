import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export const GET = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl
  
  // Sanitize searchParams — CRITICAL-003 fix
  const rawScore = searchParams.get('score') ?? '0'
  const rawZone = searchParams.get('zone') ?? 'needs-review'
  const rawDelta = searchParams.get('delta') ?? ''

  const scoreNum = parseInt(rawScore, 10)
  const score = isNaN(scoreNum) ? '0' : Math.max(0, Math.min(100, scoreNum)).toString()

  const allowedZones = ['strong', 'green', 'amber', 'needs-review']
  const zone = allowedZones.includes(rawZone) ? rawZone : 'needs-review'

  const delta = rawDelta.slice(0, 10).replace(/[^0-9+\-]/g, '')

  const zoneColor = {
    'strong': '#2D9F6F',
    'green': '#2D9F6F',
    'amber': '#D4951A',
    'needs-review': '#8896A7',
  }[zone] ?? '#8896A7'

  return new ImageResponse(
    (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        width: '1200', height: '630', backgroundColor: '#F8F7F5', fontFamily: 'Inter',
      }}>
        <div style={{ fontSize: 24, color: '#8896A7', marginBottom: 16 }}>READINESS SCORE</div>
        <div style={{ fontSize: 120, fontWeight: 700, color: zoneColor }}>{score}%</div>
        {delta && <div style={{ fontSize: 28, color: '#D4951A', marginTop: 8 }}>+{delta} points</div>}
        <div style={{ fontSize: 20, color: '#4A5568', marginTop: 32 }}>See where you stand → slatecamp.com</div>
        <div style={{ fontSize: 16, color: '#1B3FC4', marginTop: 8, fontWeight: 600 }}>SlateCamp</div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
