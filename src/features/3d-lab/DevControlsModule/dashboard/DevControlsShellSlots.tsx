'use client'

import { useState } from 'react'
import { InputPanel } from './InputPanel'
import { OutputPanel } from './OutputPanel'
import { DevControlsStatusContent } from './StatusBar'
import type { InputTab } from '../hooks/usePanelState'

export function DevControlsLeftSidebar() {
  const [activeTab, setActiveTab] = useState<InputTab>('lot')
  return <InputPanel activeTab={activeTab} onTabChange={setActiveTab} />
}

export function DevControlsRightSidebar() {
  return <OutputPanel />
}

export { DevControlsStatusContent }
