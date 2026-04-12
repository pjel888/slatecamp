# Admin Preview Fidelity Note

## Final route behavior
- Route: `/admin/preview/[previewId]`
- Admin shell chrome is bypassed in the client `AdminShell`, not hidden via CSS.
- The preview route now renders:
  - article content
  - taxonomy/article context
  - draft preview banner
- It does **not** render:
  - admin sidebar
  - admin top navigation
  - admin command palette shell

## Intentional differences from the student route
- The draft-preview banner remains intentionally visible.
- Preview-side user actions remain restricted or disabled where they would be misleading in draft mode.
- Local development may still show the global `DEV` marker. That is a development overlay, not admin chrome.

## Security posture
- The preview route remains protected by admin-capable access checks.
- The bypass only removes shell chrome; it does not widen access.

## Validation
- Browser execution confirmed the preview body no longer includes admin console navigation.
- Content still renders correctly after the shell-bypass change.
