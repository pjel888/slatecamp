import type { StorybookConfig } from '@storybook/react-vite'
import { fileURLToPath } from 'node:url'

const config: StorybookConfig = {
  stories: [
    '../src/components/**/*.stories.@(ts|tsx)',
    '../src/app/**/*.stories.@(ts|tsx)',
    '../src/features/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (viteConfig) => {
    viteConfig.resolve = viteConfig.resolve || {}
    viteConfig.resolve.alias = {
      ...(viteConfig.resolve.alias || {}),
      '@': fileURLToPath(new URL('../src', import.meta.url)),
    }

    return viteConfig
  },
}

export default config
