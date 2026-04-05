import type { Preview } from '@storybook/react'
import '../src/app/globals.css'
import './fonts.css'

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'campfire-light',
      values: [
        { name: 'campfire-light', value: '#F8F7F5' },
        { name: 'campfire-card', value: '#FFFFFF' },
        { name: 'campfire-focused', value: '#F5F7FA' },
      ],
    },
  },
}

export default preview
