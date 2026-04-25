import { existsSync, rmSync } from 'node:fs'

const generatedTypePaths = ['.next/dev/types', '.next/types']

for (const path of generatedTypePaths) {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true })
  }
}

const tscBin =
  process.platform === 'win32'
    ? './node_modules/.bin/tsc.cmd'
    : './node_modules/.bin/tsc'

const typecheck = Bun.spawn([tscBin, '--noEmit'], {
  stdin: 'inherit',
  stdout: 'inherit',
  stderr: 'inherit',
})

process.exit(await typecheck.exited)

export {}
