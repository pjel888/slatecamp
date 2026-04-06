import type { Preview } from '@storybook/react'
import { withThemeByClassName } from '@storybook/addon-themes'
import { withAppProviders } from '../src/storybook/decorators/withAppProviders'
import { installStorybookBrowserMocks } from '../src/storybook/mocks/browser'
import '../src/app/globals.css'
import './fonts.css'

installStorybookBrowserMocks()

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
      parentSelector: 'html',
    }),
    withAppProviders,
  ],
  parameters: {
    layout: 'centered',
    controls: {
      expanded: true,
    },
    backgrounds: {
      default: 'campfire-light',
      values: [
        { name: 'campfire-light', value: '#F8F7F5' },
        { name: 'campfire-card', value: '#FFFFFF' },
        { name: 'campfire-focused', value: '#F5F7FA' },
      ],
    },
    appShell: {
      pathname: '/storybook',
      search: '',
      withNoiseFilter: false,
      withToaster: false,
    },
  },
}

export default preview
