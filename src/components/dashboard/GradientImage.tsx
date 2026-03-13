'use client'

import React from 'react'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

const GradientImage = () => {
  return (
    <ShaderGradientCanvas
      style={{ position: 'absolute', inset: 0 }}
      pixelDensity={1.5}
      fov={45}
    >
      <ShaderGradient
        animate='on'
        brightness={1.2}
        cAzimuthAngle={180}
        cDistance={3.6}
        cPolarAngle={90}
        cameraZoom={1}
        color1='#ff5005'
        color2='#dbba95'
        color3='#d0bce1'
        positionX={-1.4}
        positionY={0}
        positionZ={0}
        reflection={0.1}
        rotationX={0}
        rotationY={10}
        rotationZ={50}
        shader='defaults'
        type='plane'
        uAmplitude={1}
        uDensity={1.3}
        uFrequency={5.5}
        uSpeed={0.4}
        uStrength={4}
        uTime={0}
        wireframe={false}
      />
    </ShaderGradientCanvas>
  )
}

export default GradientImage
