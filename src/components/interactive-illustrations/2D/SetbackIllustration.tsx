'use client'

import { useState, useRef, useEffect } from 'react'

const CONFIGS = [
  { label: 'Below 6m', rrow: 'below 6m', front: 1.5 },
  { label: '6–10m', rrow: '6–10m', front: 2.0 },
  { label: '10–15m', rrow: '10–15m', front: 3.0 },
  { label: '15m and above', rrow: '15m and above', front: 5.0 },
]

const SIDE = 2.0
const REAR = 2.0
const SC = 20
const LX = 110,
  LW = 360
const RT = 52,
  RH = 68
const LT = RT + RH
const LH = 310

interface SetbackConfig {
  label: string
  rrow: string
  front: number
}

function SetbackSVG({ config }: { config: SetbackConfig }) {
  const fp = config.front * SC
  const sp = SIDE * SC
  const rp = REAR * SC
  const bx = LX + sp
  const by = LT + fp
  const bw = LW - 2 * sp
  const bh = LH - fp - rp

  return (
    <svg width='100%' viewBox='0 0 680 510' style={{ display: 'block' }}>
      <defs>
        <marker
          id='arr'
          viewBox='0 0 10 10'
          refX='8'
          refY='5'
          markerWidth='5'
          markerHeight='5'
          orient='auto-start-reverse'
        >
          <path
            d='M2 1L8 5L2 9'
            fill='none'
            stroke='context-stroke'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </marker>
        <pattern
          id='ht'
          patternUnits='userSpaceOnUse'
          width='8'
          height='8'
          patternTransform='rotate(45)'
        >
          <line
            x1='0'
            y1='0'
            x2='0'
            y2='8'
            stroke='#BA7517'
            strokeWidth='1.2'
            strokeOpacity='0.4'
          />
        </pattern>
      </defs>

      {/* Road */}
      <rect x={LX} y={RT} width={LW} height={RH} fill='#D3D1C7' rx='6' />
      <line
        x1={LX + 40}
        y1={RT + RH / 2}
        x2={LX + 160}
        y2={RT + RH / 2}
        stroke='#B4B2A9'
        strokeWidth='2.5'
        strokeDasharray='12 9'
        strokeLinecap='round'
      />
      <line
        x1={LX + 220}
        y1={RT + RH / 2}
        x2={LX + 320}
        y2={RT + RH / 2}
        stroke='#B4B2A9'
        strokeWidth='2.5'
        strokeDasharray='12 9'
        strokeLinecap='round'
      />
      <text
        x={LX + LW / 2}
        y={RT + RH / 2 - 7}
        textAnchor='middle'
        dominantBaseline='central'
        style={{ fontSize: 12, fill: '#5F5E5A', fontWeight: 500 }}
      >
        Road
      </text>
      <text
        x={LX + LW / 2}
        y={RT + RH / 2 + 10}
        textAnchor='middle'
        dominantBaseline='central'
        style={{ fontSize: 11, fill: '#888780' }}
      >
        RROW: {config.rrow}
      </text>

      {/* Lot base */}
      <rect x={LX} y={LT} width={LW} height={LH} fill='#EAF3DE' rx='4' />

      {/* Setback zones */}
      {/* Front */}
      <rect x={LX} y={LT} width={LW} height={fp} fill='#FAEEDA' />
      <rect x={LX} y={LT} width={LW} height={fp} fill='url(#ht)' />
      {/* Left side */}
      <rect
        x={LX}
        y={LT + fp}
        width={sp}
        height={LH - fp - rp}
        fill='#FAEEDA'
      />
      <rect
        x={LX}
        y={LT + fp}
        width={sp}
        height={LH - fp - rp}
        fill='url(#ht)'
      />
      {/* Right side */}
      <rect
        x={LX + LW - sp}
        y={LT + fp}
        width={sp}
        height={LH - fp - rp}
        fill='#FAEEDA'
      />
      <rect
        x={LX + LW - sp}
        y={LT + fp}
        width={sp}
        height={LH - fp - rp}
        fill='url(#ht)'
      />
      {/* Rear */}
      <rect x={LX} y={LT + LH - rp} width={LW} height={rp} fill='#FAEEDA' />
      <rect x={LX} y={LT + LH - rp} width={LW} height={rp} fill='url(#ht)' />

      {/* Buildable area */}
      {bh > 16 && (
        <>
          <rect
            x={bx}
            y={by}
            width={bw}
            height={bh}
            fill='#5DCAA5'
            opacity='0.22'
            rx='4'
          />
          <rect
            x={bx}
            y={by}
            width={bw}
            height={bh}
            fill='none'
            stroke='#1D9E75'
            strokeWidth='1.5'
            strokeDasharray='6 3'
            rx='4'
          />
          <text
            x={bx + bw / 2}
            y={by + bh / 2 - 9}
            textAnchor='middle'
            dominantBaseline='central'
            style={{ fontSize: 14, fill: '#085041', fontWeight: 500 }}
          >
            Buildable area
          </text>
          <text
            x={bx + bw / 2}
            y={by + bh / 2 + 10}
            textAnchor='middle'
            dominantBaseline='central'
            style={{ fontSize: 12, fill: '#0F6E56' }}
          >
            {bw / SC}m × {Math.round((bh / SC) * 10) / 10}m
          </text>
        </>
      )}

      {/* Lot boundary */}
      <rect
        x={LX}
        y={LT}
        width={LW}
        height={LH}
        fill='none'
        stroke='#27500A'
        strokeWidth='1.5'
        rx='4'
      />

      {/* Property line label */}
      <text
        x={LX + LW / 2}
        y={LT - 9}
        textAnchor='middle'
        style={{ fontSize: 11, fill: '#444441' }}
      >
        — property line —
      </text>

      {/* Front setback dim arrow */}
      <line
        x1={LX - 30}
        y1={LT}
        x2={LX - 30}
        y2={LT + fp}
        stroke='#BA7517'
        strokeWidth='1'
        markerEnd='url(#arr)'
        markerStart='url(#arr)'
      />
      <line
        x1={LX - 34}
        y1={LT}
        x2={LX - 2}
        y2={LT}
        stroke='#BA7517'
        strokeWidth='0.5'
        opacity='0.6'
      />
      <line
        x1={LX - 34}
        y1={LT + fp}
        x2={LX - 2}
        y2={LT + fp}
        stroke='#BA7517'
        strokeWidth='0.5'
        opacity='0.6'
      />
      <text
        x={LX - 38}
        y={LT + fp / 2 - 7}
        textAnchor='end'
        dominantBaseline='central'
        style={{ fontSize: 13, fill: '#854F0B', fontWeight: 500 }}
      >
        {config.front.toFixed(1)}m
      </text>
      <text
        x={LX - 38}
        y={LT + fp / 2 + 9}
        textAnchor='end'
        dominantBaseline='central'
        style={{ fontSize: 11, fill: '#BA7517' }}
      >
        front
      </text>

      {/* Left side dim arrow */}
      <line
        x1={LX}
        y1={LT + LH * 0.42}
        x2={LX + sp}
        y2={LT + LH * 0.42}
        stroke='#BA7517'
        strokeWidth='1'
        markerEnd='url(#arr)'
        markerStart='url(#arr)'
      />
      <text
        x={LX + sp / 2}
        y={LT + LH * 0.42 - 13}
        textAnchor='middle'
        style={{ fontSize: 12, fill: '#854F0B', fontWeight: 500 }}
      >
        2m
      </text>
      <text
        x={LX + sp / 2}
        y={LT + LH * 0.42 + 1}
        textAnchor='middle'
        dominantBaseline='central'
        style={{ fontSize: 10, fill: '#BA7517' }}
      >
        side
      </text>

      {/* Right side dim arrow */}
      <line
        x1={LX + LW - sp}
        y1={LT + LH * 0.65}
        x2={LX + LW}
        y2={LT + LH * 0.65}
        stroke='#BA7517'
        strokeWidth='1'
        markerEnd='url(#arr)'
        markerStart='url(#arr)'
      />
      <text
        x={LX + LW - sp / 2}
        y={LT + LH * 0.65 - 13}
        textAnchor='middle'
        style={{ fontSize: 12, fill: '#854F0B', fontWeight: 500 }}
      >
        2m
      </text>
      <text
        x={LX + LW - sp / 2}
        y={LT + LH * 0.65 + 1}
        textAnchor='middle'
        dominantBaseline='central'
        style={{ fontSize: 10, fill: '#BA7517' }}
      >
        side
      </text>

      {/* Rear setback dim arrow */}
      <line
        x1={LX + LW + 30}
        y1={LT + LH - rp}
        x2={LX + LW + 30}
        y2={LT + LH}
        stroke='#BA7517'
        strokeWidth='1'
        markerEnd='url(#arr)'
        markerStart='url(#arr)'
      />
      <line
        x1={LX + LW + 2}
        y1={LT + LH - rp}
        x2={LX + LW + 34}
        y2={LT + LH - rp}
        stroke='#BA7517'
        strokeWidth='0.5'
        opacity='0.6'
      />
      <line
        x1={LX + LW + 2}
        y1={LT + LH}
        x2={LX + LW + 34}
        y2={LT + LH}
        stroke='#BA7517'
        strokeWidth='0.5'
        opacity='0.6'
      />
      <text
        x={LX + LW + 38}
        y={LT + LH - rp / 2 - 7}
        style={{ fontSize: 13, fill: '#854F0B', fontWeight: 500 }}
      >
        2m
      </text>
      <text
        x={LX + LW + 38}
        y={LT + LH - rp / 2 + 9}
        style={{ fontSize: 11, fill: '#BA7517' }}
      >
        rear
      </text>

      {/* Compass */}
      <text
        x='68'
        y={RT + 4}
        textAnchor='middle'
        style={{ fontSize: 11, fill: '#888780' }}
      >
        ↑
      </text>
      <text
        x='68'
        y={RT + 16}
        textAnchor='middle'
        style={{ fontSize: 11, fill: '#888780' }}
      >
        N
      </text>

      {/* Legend */}
      <rect
        x={LX}
        y={LT + LH + 22}
        width='11'
        height='11'
        fill='#FAEEDA'
        stroke='#BA7517'
        strokeWidth='0.5'
        rx='2'
      />
      <rect
        x={LX}
        y={LT + LH + 22}
        width='11'
        height='11'
        fill='url(#ht)'
        rx='2'
      />
      <text
        x={LX + 17}
        y={LT + LH + 28}
        dominantBaseline='central'
        style={{ fontSize: 12, fill: '#5F5E5A' }}
      >
        No-build setback
      </text>
      <rect
        x={LX + 180}
        y={LT + LH + 22}
        width='11'
        height='11'
        fill='#5DCAA5'
        opacity='0.3'
        stroke='#1D9E75'
        strokeWidth='0.5'
        rx='2'
      />
      <text
        x={LX + 197}
        y={LT + LH + 28}
        dominantBaseline='central'
        style={{ fontSize: 12, fill: '#5F5E5A' }}
      >
        Buildable area
      </text>
      <rect
        x={LX + 330}
        y={LT + LH + 22}
        width='11'
        height='11'
        fill='#D3D1C7'
        rx='2'
      />
      <text
        x={LX + 347}
        y={LT + LH + 28}
        dominantBaseline='central'
        style={{ fontSize: 12, fill: '#5F5E5A' }}
      >
        Road
      </text>
    </svg>
  )
}

export default function PHBuildingSetbacks() {
  const [curIdx, setCurIdx] = useState(1)
  const config = CONFIGS[curIdx]
  const fp = config.front * SC
  const bh = LH - fp - REAR * SC

  const styles: Record<string, any> = {
    wrapper: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: 720,
      margin: '0 auto',
      padding: '1.5rem 1rem',
    },
    title: {
      fontSize: 18,
      fontWeight: 500,
      margin: '0 0 4px',
      color: '#1a1a18',
    },
    subtitle: {
      fontSize: 13,
      color: '#888780',
      margin: '0 0 1.25rem',
    },
    label: {
      fontSize: 13,
      color: '#5F5E5A',
      marginBottom: 8,
    },
    btnRow: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: '1.25rem',
    },
    btn: (active: boolean) => ({
      padding: '7px 13px',
      fontSize: 13,
      borderRadius: 8,
      border: active ? 'none' : '0.5px solid #c2c0b6',
      background: active ? '#E6F1FB' : 'transparent',
      color: active ? '#0C447C' : '#5F5E5A',
      fontWeight: active ? 500 : 400,
      cursor: 'pointer',
      transition: 'all 0.15s',
    }),
    cards: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: 10,
      marginTop: '1.25rem',
    },
    card: {
      background: '#f5f4f0',
      borderRadius: 8,
      padding: '0.875rem',
    },
    cardLabel: {
      fontSize: 12,
      color: '#888780',
      margin: '0 0 4px',
    },
    cardValue: {
      fontSize: 22,
      fontWeight: 500,
      margin: 0,
      color: '#1a1a18',
    },
    note: {
      fontSize: 12,
      color: '#888780',
      marginTop: '1rem',
      lineHeight: 1.6,
    },
  }

  return (
    <div style={styles.wrapper}>
      <p style={styles.title}>Philippine building setbacks</p>
      <p style={styles.subtitle}>
        PD 1096 National Building Code — IRR Rule VII, Section 708
      </p>

      <p style={styles.label}>Road right-of-way (RROW) width:</p>
      <div style={styles.btnRow}>
        {CONFIGS.map((c, i) => (
          <button
            key={i}
            style={styles.btn(i === curIdx)}
            onClick={() => setCurIdx(i)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <SetbackSVG config={config} />

      <div style={styles.cards}>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Front setback</p>
          <p style={styles.cardValue}>{config.front.toFixed(1)}m</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Side setback (each)</p>
          <p style={styles.cardValue}>2.0m</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Rear setback</p>
          <p style={styles.cardValue}>2.0m</p>
        </div>
      </div>

      <p style={styles.note}>
        Side and rear setbacks may be waived if a firewall is constructed on the
        property line. Always verify with your local Building Official — LGU
        ordinances may impose stricter minimums.
      </p>
    </div>
  )
}
