# Client-Server Boundary Rules

**Last Updated:** 2026-04-16

## Rules grounded in current reality
1. Treat client stores as exceptional, not default.
2. Keep server actions as the primary mutation boundary.
3. When a client store calls server actions directly, document why it cannot remain route-local.
4. Re-measure client-component share after major UI/platform changes.
5. Treat 3D Lab, quiz shells, and device/gesture systems as justified client domains—but still audit them for avoidable coupling.
