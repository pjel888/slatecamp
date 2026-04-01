// Server-only guard — Behavioral inference must never run in client bundles
// If this file is imported by a client component, the build will fail
import 'server-only'
