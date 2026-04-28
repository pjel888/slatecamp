// src/app/dashboard/3d-lab/_constants/nbcp.test.ts
import { describe, test, expect } from 'bun:test'
import { getRrowBhl, getBaseSetbacks, ZONING_TABLE, ZoningClass } from './nbcp'

describe('getRrowBhl', () => {
  test('8.00m maps to 5 storeys (>= lower bound)', () => {
    expect(getRrowBhl(8)).toBe(5)
  })
  test('7.99m maps to 3 storeys', () => {
    expect(getRrowBhl(7.99)).toBe(3)
  })
  test('15m maps to 15 storeys', () => {
    expect(getRrowBhl(15)).toBe(15)
  })
  test('30m maps to 36 storeys', () => {
    expect(getRrowBhl(30)).toBe(36)
  })
  test('12m maps to 12 storeys', () => {
    expect(getRrowBhl(12)).toBe(12)
  })
})

describe('getBaseSetbacks — R1', () => {
  test('R1, 2 storeys, RROW < 10: front 3.0m', () => {
    const sb = getBaseSetbacks(ZoningClass.R1, 8, 2)
    expect(sb.front).toBe(3.0)
    expect(sb.side).toBe(1.5)
    expect(sb.rear).toBe(2.0)
  })
  test('R1, 2 storeys, RROW >= 10: front 4.5m', () => {
    const sb = getBaseSetbacks(ZoningClass.R1, 10, 2)
    expect(sb.front).toBe(4.5)
  })
  test('R1, 3 storeys: front 4.5m regardless of RROW', () => {
    expect(getBaseSetbacks(ZoningClass.R1, 8, 3).front).toBe(4.5)
    expect(getBaseSetbacks(ZoningClass.R1, 15, 3).front).toBe(4.5)
  })
})

describe('getBaseSetbacks — General (Table VIII.3)', () => {
  test('RROW 10m: front 5.0, side 2.0, rear 2.0', () => {
    const sb = getBaseSetbacks(ZoningClass.R3, 10, 5)
    expect(sb).toEqual({ front: 5.0, side: 2.0, rear: 2.0 })
  })
  test('RROW 15m: front 5.0, side 3.0, rear 3.0', () => {
    const sb = getBaseSetbacks(ZoningClass.R3, 15, 12)
    expect(sb).toEqual({ front: 5.0, side: 3.0, rear: 3.0 })
  })
  test('RROW 30m: front 8.0, side 5.0, rear 5.0', () => {
    const sb = getBaseSetbacks(ZoningClass.C2, 30, 15)
    expect(sb).toEqual({ front: 8.0, side: 5.0, rear: 5.0 })
  })
})

describe('ZONING_TABLE spot checks', () => {
  test('R3 FLAR is 5.0, BHL 12 storeys, PSO inside 70%', () => {
    const entry = ZONING_TABLE[ZoningClass.R3]
    expect(entry.flar).toBe(5.0)
    expect(entry.bhl_storeys).toBe(12)
    expect(entry.pso_inside).toBe(0.70)
    expect(entry.pso_corner).toBe(0.75)
  })
  test('R2_MAX BHL is 5 storeys', () => {
    expect(ZONING_TABLE[ZoningClass.R2_MAX].bhl_storeys).toBe(5)
  })
  test('C2 is not residential', () => {
    expect(ZONING_TABLE[ZoningClass.C2].isResidential).toBe(false)
  })
})
