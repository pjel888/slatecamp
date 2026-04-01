'use client'

import { useRef, useCallback, useEffect } from 'react'

interface SensorReading {
  accelerometer: { x: number; y: number; z: number } | null
  gyroscope: { alpha: number; beta: number; gamma: number } | null
}

interface UseDeviceSensorsReturn {
  /** Start capturing sensor data */
  startCapture: () => void
  /** Stop capturing and return latest reading */
  stopCapture: () => void
  /** Get the latest sensor reading */
  getLatestReading: () => SensorReading
  /** Whether sensors are available on this device */
  sensorsAvailable: boolean
}

export function useDeviceSensors(): UseDeviceSensorsReturn {
  const latestRef = useRef<SensorReading>({ accelerometer: null, gyroscope: null })
  const activeRef = useRef(false)
  const availableRef = useRef(false)

  // Check availability on mount
  useEffect(() => {
    availableRef.current =
      typeof DeviceMotionEvent !== 'undefined' ||
      typeof DeviceOrientationEvent !== 'undefined'
  }, [])

  const handleMotion = useCallback((e: DeviceMotionEvent) => {
    if (!activeRef.current) return
    if (e.accelerationIncludingGravity) {
      latestRef.current.accelerometer = {
        x: e.accelerationIncludingGravity.x ?? 0,
        y: e.accelerationIncludingGravity.y ?? 0,
        z: e.accelerationIncludingGravity.z ?? 0,
      }
    }
  }, [])

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (!activeRef.current) return
    latestRef.current.gyroscope = {
      alpha: e.alpha ?? 0,
      beta: e.beta ?? 0,
      gamma: e.gamma ?? 0,
    }
  }, [])

  const startCapture = useCallback(() => {
    activeRef.current = true
    latestRef.current = { accelerometer: null, gyroscope: null }

    // iOS 13+ requires permission
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((state: string) => {
          if (state === 'granted') {
            window.addEventListener('devicemotion', handleMotion)
            window.addEventListener('deviceorientation', handleOrientation)
          }
        })
        .catch(() => { /* Graceful degradation — sensors optional */ })
    } else {
      window.addEventListener('devicemotion', handleMotion)
      window.addEventListener('deviceorientation', handleOrientation)
    }
  }, [handleMotion, handleOrientation])

  const stopCapture = useCallback(() => {
    activeRef.current = false
    window.removeEventListener('devicemotion', handleMotion)
    window.removeEventListener('deviceorientation', handleOrientation)
  }, [handleMotion, handleOrientation])

  const getLatestReading = useCallback(() => ({ ...latestRef.current }), [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', handleMotion)
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [handleMotion, handleOrientation])

  return {
    startCapture,
    stopCapture,
    getLatestReading,
    get sensorsAvailable() { return availableRef.current },
  }
}
