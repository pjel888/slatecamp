'use client'

import React from 'react'
import { ArticleMedia } from '@/components/wiki/blocks/ArticleMedia'

export default function TestMediaClient() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1>ArticleMedia Test</h1>
      <ArticleMedia 
        id="test-001" 
        layout="single" 
        type="image" 
        status="placeholder" 
        alt="Test image description" 
        caption="Test caption" 
        suggestedAsset="Architectural reference image" 
        placementIntent="Visual reference"
      />
      <p>If you see a dashed-border box above, the component works!</p>
    </div>
  )
}
