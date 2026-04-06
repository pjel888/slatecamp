import type { StorybookConfig } from '@storybook/react-vite'
import { fileURLToPath } from 'node:url'

const config: StorybookConfig = {
  stories: [
    '../src/components/**/*.stories.@(ts|tsx)',
    '../src/features/**/*.stories.@(ts|tsx)',
    '../src/storybook/scenes/**/*.stories.@(ts|tsx)',
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
      '@/lib/actions/ei-prompts': fileURLToPath(
        new URL('../src/storybook/mocks/ei-prompts.ts', import.meta.url),
      ),
      '@/lib/actions/notes-actions': fileURLToPath(
        new URL('../src/storybook/mocks/notes-actions.ts', import.meta.url),
      ),
      '@/lib/actions/teach-back': fileURLToPath(
        new URL('../src/storybook/mocks/teach-back.ts', import.meta.url),
      ),
      '@/lib/actions/wiki': fileURLToPath(
        new URL('../src/storybook/mocks/wiki.ts', import.meta.url),
      ),
      '@/lib/actions/wiki-actions': fileURLToPath(
        new URL('../src/storybook/mocks/wiki-actions.ts', import.meta.url),
      ),
      '@/lib/actions/wiki-bookmarks': fileURLToPath(
        new URL('../src/storybook/mocks/wiki-bookmarks.ts', import.meta.url),
      ),
      '@/lib/actions/wiki-interactions': fileURLToPath(
        new URL('../src/storybook/mocks/wiki-interactions.ts', import.meta.url),
      ),
      '@/lib/actions/wiki-quiz': fileURLToPath(
        new URL('../src/storybook/mocks/wiki-quiz.ts', import.meta.url),
      ),
      '@/lib/analytics': fileURLToPath(
        new URL('../src/storybook/mocks/analytics.ts', import.meta.url),
      ),
      '@': fileURLToPath(new URL('../src', import.meta.url)),
      'next/dynamic': fileURLToPath(
        new URL('../src/storybook/mocks/next-dynamic.tsx', import.meta.url),
      ),
      'next/link': fileURLToPath(
        new URL('../src/storybook/mocks/next-link.tsx', import.meta.url),
      ),
      'next/navigation': fileURLToPath(
        new URL('../src/storybook/mocks/next-navigation.tsx', import.meta.url),
      ),
    }

    return viteConfig
  },
}

export default config
