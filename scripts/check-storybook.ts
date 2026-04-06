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
const REAL_COMPONENT_IMPORT_PATH = /^@\/features\/.+\/components\//
const NON_COMPONENT_RELATIVE_SEGMENTS = [
  '/config/',
  '/constants/',
  '/docs/',
  '/fixtures/',
  '/hooks/',
  '/mocks/',
  '/types/',
  '/utils/',
]

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

const getStoryEntries = async () => {
  const files: string[] = []

  for (const root of STORYBOOK_SCAN_ROOTS) {
    files.push(...(await walkStoryFiles(root)))
  }

  const sortedFiles = files.sort()

  return Promise.all(
    sortedFiles.map(async (filePath) => ({
      filePath: normalizePath(relative(process.cwd(), filePath)),
      content: await readFile(filePath, 'utf8'),
    }))
  )
}

const getValueImportSpecifiers = (content: string) => {
  const importSpecifiers: string[] = []
  const importPattern = /^import\s+(?!type\b)[\s\S]*?\sfrom\s+['"]([^'"]+)['"]/gm

  for (const match of content.matchAll(importPattern)) {
    const specifier = match[1]

    if (specifier) {
      importSpecifiers.push(specifier)
    }
  }

  return importSpecifiers
}

const isRelativeComponentImport = (specifier: string) => {
  if (!specifier.startsWith('./') && !specifier.startsWith('../')) {
    return false
  }

  if (
    specifier.includes('.stories.') ||
    /\.(css|less|md|mdx|sass|scss|svg|json)$/i.test(specifier)
  ) {
    return false
  }

  return !NON_COMPONENT_RELATIVE_SEGMENTS.some((segment) => specifier.includes(segment))
}

const isRealComponentImport = (specifier: string) =>
  specifier.startsWith('@/components/') ||
  REAL_COMPONENT_IMPORT_PATH.test(specifier) ||
  isRelativeComponentImport(specifier)

const getStoriesWithoutRealComponentImport = (
  storyEntries: Array<{ filePath: string; content: string }>
) =>
  storyEntries
    .filter(({ content }) => !getValueImportSpecifiers(content).some(isRealComponentImport))
    .map(({ filePath }) => filePath)

const main = async () => {
  const storyEntries = await getStoryEntries()
  const currentMarkerFiles = storyEntries
    .filter(({ content }) => content.includes(STORYBOOK_PLACEHOLDER_MARKER))
    .map(({ filePath }) => filePath)
  const baseline = new Set<string>(STORYBOOK_PLACEHOLDER_BASELINE)
  const unexpectedMarkerFiles = currentMarkerFiles.filter((filePath) => !baseline.has(filePath))
  const clearedBaselineFiles = STORYBOOK_PLACEHOLDER_BASELINE.filter(
    (filePath) => !currentMarkerFiles.includes(filePath)
  )
  const storiesWithoutRealComponentImport = getStoriesWithoutRealComponentImport(storyEntries)

  if (unexpectedMarkerFiles.length > 0 || storiesWithoutRealComponentImport.length > 0) {
    const errors: string[] = []

    if (unexpectedMarkerFiles.length > 0) {
      errors.push(
        [
          'Unexpected Storybook placeholder scaffold detected.',
          'New files containing the placeholder marker must not enter the repository:',
          ...unexpectedMarkerFiles.map((filePath) => `- ${filePath}`),
        ].join('\n')
      )
    }

    if (storiesWithoutRealComponentImport.length > 0) {
      errors.push(
        [
          'Story files must import at least one real component module.',
          'Allowed component imports come from `@/components/*`, `@/features/**/components/*`, or a relative component module:',
          ...storiesWithoutRealComponentImport.map((filePath) => `- ${filePath}`),
        ].join('\n')
      )
    }

    console.error(errors.join('\n\n'))
    process.exit(1)
  }

  console.log(
    `Storybook guard OK: ${storyEntries.length} story file(s) scanned; ${currentMarkerFiles.length} placeholder marker file(s) still tracked.`
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
  console.error('Failed to validate Storybook governance checks.')
  console.error(error)
  process.exit(1)
})
