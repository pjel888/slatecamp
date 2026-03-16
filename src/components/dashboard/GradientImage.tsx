'use client'

import React from 'react'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

const GradientImage = () => {
  return (
    <ShaderGradientCanvas
      style={{ position: 'absolute', inset: 0 }}
      pixelDensity={1.5}
      fov={2}
    >
      <ShaderGradient
        animate='on'
        brightness={1.2}
        cAzimuthAngle={180}
        cDistance={10}
        cPolarAngle={90}
        cameraZoom={0}
        color1='#154182'
        color2='#6da6ad'
        color3='#d0bce1'
        positionX={0}
        positionY={0}
        positionZ={0}
        reflection={0.1}
        rotationX={0}
        rotationY={0}
        rotationZ={0}
        shader='defaults'
        type='plane'
        uAmplitude={2}
        uDensity={1}
        uFrequency={1}
        uSpeed={0.4}
        uStrength={2}
        uTime={0}
        wireframe={false}
      />
    </ShaderGradientCanvas>
  )
}

export default GradientImage
