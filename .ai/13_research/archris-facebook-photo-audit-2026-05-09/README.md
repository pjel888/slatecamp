# ARCHRIS Facebook Photo Audit — 2026-05-09

Target: ARCHRIS Architecture Review
Facebook URL: https://web.facebook.com/people/ARCHRIS-Architecture-Review/61559691737674/?sk=photos

This folder sits beside the VizCode competitive audit pack and is intended for internal SlateCamp competitor/visual-surface analysis.

Capture boundary:
- This is a competitor media/visual audit, not security work.
- Use public/no-cookie capture first.
- Do not extract, print, or commit Facebook cookies.
- Do not use private account-recovery or login-checkpoint flows as part of the scrape.
- Saved competitor images are evidence for internal analysis only; do not republish or reuse their copyrighted graphics.

Structure:
- `scripts/` — capture tooling
- `raw/` — endpoint HTML/text evidence
- `assets/facebook-photos/` — downloaded image assets
- `manifest.json` — machine-readable capture manifest
- `image-index.json` — verified image dimensions/source metadata
- `IMAGE_INDEX.md` — human-readable image index
- `ARCHRIS_FACEBOOK_CONTACT_SHEET.jpg` — 23-image labeled contact sheet for quick review
- `ARCHRIS_FACEBOOK_CAPTURE_REPORT.md` — human-readable capture report
- `PRELIMINARY_VISUAL_AUDIT.md` — first-pass competitive visual analysis

Status:
- Public/no-cookie capture found 31 image candidates and saved 23 unique image files.
- The full Facebook Photos grid may expose more assets only inside an authenticated browser session. If needed, manually open the visible Photos tab in Chrome and capture visible DOM image URLs from that page without exporting cookies.
