const port = process.env.PLAYWRIGHT_PORT ?? '3217'
const useBuiltApp = process.env.PLAYWRIGHT_USE_BUILT_APP === 'true'
const demoAuthEnabled = process.env.PLAYWRIGHT_DEMO_AUTH === 'true'

const env = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => {
    return typeof entry[1] === 'string'
  }),
)

delete env.DEV_FORCE_USER_ID
delete env.DEV_FORCE_TIER
delete env.NEXT_PUBLIC_DEMO_MODE

env.ALLOW_DEV_PORTAL_BYPASS = 'false'
env.DISABLE_DEV_FORCE_USER_ID = 'true'
env.NEXT_PUBLIC_APP_URL ??= `http://localhost:${port}`
env.NEXT_PUBLIC_ENABLE_DEMO_MODE = demoAuthEnabled ? 'true' : 'false'
env.NEXT_PUBLIC_PAYMENTS_ENABLED ??= 'false'
env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'ci-anon-key'
env.NEXT_PUBLIC_SUPABASE_URL ??= 'https://hrpdwqurngnyajuhbkdg.supabase.co'

const nextBin =
  process.platform === 'win32'
    ? './node_modules/.bin/next.cmd'
    : './node_modules/.bin/next'

const args = useBuiltApp
  ? ['start', '--port', port]
  : ['dev', '--webpack', '--port', port]

const server = Bun.spawn([nextBin, ...args], {
  env,
  stdin: 'ignore',
  stdout: 'inherit',
  stderr: 'inherit',
})

const stop = () => {
  server.kill()
}

process.on('SIGINT', stop)
process.on('SIGTERM', stop)

process.exit(await server.exited)

export {}
