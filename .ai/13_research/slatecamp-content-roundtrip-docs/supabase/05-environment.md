# Environment

Use existing environment variable names if the repo already defines them.

Common requirements:

```text
NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY for server-side scripts
SUPABASE_ANON_KEY only if appropriate for read-only operations
```

Do not expose service role keys to client code.

Local scripts should run server-side only.
