import { existsSync, readFileSync, rmSync } from 'node:fs'
import path from 'node:path'

const nextBin =
  process.platform === 'win32'
    ? './node_modules/.bin/next.cmd'
    : './node_modules/.bin/next'

function processIsAlive(pid: number) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

function clearStaleNextDevLock() {
  const devDir = path.join(process.cwd(), '.next/dev')
  const lockPath = path.join(devDir, 'lock')
  if (!existsSync(lockPath)) return

  try {
    const lock = JSON.parse(readFileSync(lockPath, 'utf8')) as { pid?: unknown }
    const pid = typeof lock.pid === 'number' ? lock.pid : Number(lock.pid)
    if (Number.isFinite(pid) && processIsAlive(pid)) {
      console.warn(
        `[next-build] Refusing to start while Next dev server ${pid} is still alive.`,
      )
      process.exit(1)
    }

    rmSync(devDir, { force: true, recursive: true })
    console.warn(`[next-build] Removed stale Next dev cache at ${devDir}`)
  } catch (error) {
    console.warn(
      `[next-build] Could not inspect Next dev lock at ${lockPath}: ${String(error)}`,
    )
  }
}

clearStaleNextDevLock()

const build = Bun.spawn([nextBin, 'build'], {
  env: process.env,
  stdin: 'inherit',
  stdout: 'inherit',
  stderr: 'inherit',
})

process.exit(await build.exited)
