import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'

interface DeveloperRepoMetrics {
  storyCount: number
  sourceFileCount: number
}

const STORY_EXTENSIONS = ['.stories.ts', '.stories.tsx', '.stories.mdx']
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.mdx']

const walk = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next') {
          return []
        }
        return walk(fullPath)
      }
      return [fullPath]
    }),
  )

  return files.flat()
}

export const getDeveloperRepoMetrics = cache(async (): Promise<DeveloperRepoMetrics> => {
  const root = process.cwd()
  const srcFiles = await walk(path.join(root, 'src'))
  const storybookFiles = await walk(path.join(root, '.storybook')).catch(() => [])

  const allFiles = [...srcFiles, ...storybookFiles]

  const storyCount = allFiles.filter((file) =>
    STORY_EXTENSIONS.some((ext) => file.endsWith(ext)),
  ).length

  const sourceFileCount = srcFiles.filter((file) =>
    SOURCE_EXTENSIONS.some((ext) => file.endsWith(ext)),
  ).length

  return {
    storyCount,
    sourceFileCount,
  }
})
