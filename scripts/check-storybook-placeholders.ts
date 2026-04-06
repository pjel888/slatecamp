import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import {
  STORYBOOK_PLACEHOLDER_BASELINE,
  STORYBOOK_PLACEHOLDER_MARKER,
} from './storybook-placeholder-baseline'

const STORYBOOK_SCAN_ROOTS = ['src', '.storybook']
const IGNORED_DIRECTORIES = new Set([
  '.git',
  '.next',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
])

const normalizePath = (filePath: string) => filePath.replaceAll('\\', '/')

const isStoryFile = (filePath: string) =>
  filePath.endsWith('.stories.ts') || filePath.endsWith('.stories.tsx')

const walkStoryFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    if (IGNORED_DIRECTORIES.has(entry.name)) {
      continue
    }

    const fullPath = join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await walkStoryFiles(fullPath)))
      continue
    }

    if (entry.isFile() && isStoryFile(fullPath)) {
      files.push(fullPath)
    }
  }

  return files
}

const findMarkerFiles = async () => {
  const markerFiles: string[] = []

  for (const root of STORYBOOK_SCAN_ROOTS) {
    const files = await walkStoryFiles(root)

    for (const file of files) {
      const content = await readFile(file, 'utf8')

      if (content.includes(STORYBOOK_PLACEHOLDER_MARKER)) {
        markerFiles.push(normalizePath(relative(process.cwd(), file)))
      }
    }
  }

  return markerFiles.sort()
}

const main = async () => {
  const currentMarkerFiles = await findMarkerFiles()
  const baseline = new Set<string>(STORYBOOK_PLACEHOLDER_BASELINE)
  const unexpectedMarkerFiles = currentMarkerFiles.filter((filePath) => !baseline.has(filePath))
  const clearedBaselineFiles = STORYBOOK_PLACEHOLDER_BASELINE.filter(
    (filePath) => !currentMarkerFiles.includes(filePath)
  )

  if (unexpectedMarkerFiles.length > 0) {
    console.error(
      [
        'Unexpected Storybook placeholder scaffold detected.',
        'New files containing the placeholder marker must not enter the repository:',
        ...unexpectedMarkerFiles.map((filePath) => `- ${filePath}`),
      ].join('\n')
    )

    process.exit(1)
  }

  console.log(
    `Storybook placeholder baseline OK: ${currentMarkerFiles.length} tracked scaffold file(s) still contain the marker.`
  )

  if (clearedBaselineFiles.length > 0) {
    console.log(
      [
        'Baseline files already cleaned or removed:',
        ...clearedBaselineFiles.map((filePath) => `- ${filePath}`),
      ].join('\n')
    )
  }
}

main().catch((error) => {
  console.error('Failed to validate Storybook placeholder baseline.')
  console.error(error)
  process.exit(1)
})
