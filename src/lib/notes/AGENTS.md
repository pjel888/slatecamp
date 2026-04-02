<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# notes

## Purpose

The `notes` directory provides note-taking utilities: image upload to Supabase Storage with signed URLs. Enables students to attach images to study notes (e.g., diagrams, reference photos) with 1-year expiry and user-specific folder organization.

## Key Files

| File | Description |
|------|-------------|
| `uploadImage.ts` | Client-side image upload: `uploadNoteImage(file, userId)` → signed URL (1-year expiry) |

## For AI Agents

### Working In This Directory

**Image Upload Flow:**
1. User selects image file in notes editor (onchange).
2. Call `uploadNoteImage(file, userId)` in client component.
3. File uploaded to `note-images` bucket under `userId/` folder.
4. Return signed URL (valid for 1 year).
5. Embed URL in note content (TipTap JSON, markdown image syntax, etc.).

**File Naming:**
- Path: `{userId}/{randomUUID}.{ext}`.
- Example: `user-123/a1b2c3d4-e5f6-7890-abcd/png`.
- Random UUID prevents collisions and path guessing.

**Storage Settings:**
- Bucket: `note-images` (must exist in Supabase Storage).
- Cache control: 31536000 seconds (1 year), `upsert: false` to prevent overwrites.
- Signed URL duration: 60 × 60 × 24 × 365 (1 year) = 31536000 seconds.

**Error Handling:**
- Upload error → throw message (component catches and shows toast).
- Signed URL generation failure → throw error (should not happen if upload succeeds).

### Common Patterns

**Uploading Image (Client):**
```typescript
'use client'

import { uploadNoteImage } from '@/lib/notes'
import { useToast } from '@/lib/hooks/useToast'
import { useUser } from '@/lib/context/AuthContext'

const NotesEditor = () => {
  const { user } = useUser()
  const { toast } = useToast()
  
  const handleImageUpload = async (file: File) => {
    try {
      const signedUrl = await uploadNoteImage(file, user.id)
      // Insert image into editor
      insertImage(signedUrl, file.name)
      toast({ title: 'Image uploaded' })
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' })
    }
  }
  
  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
    />
  )
}
```

**In TipTap Editor:**
```typescript
// When inserting into TipTap JSON:
editor.commands.setImage({ src: signedUrl, alt: file.name })

// In rendered note (HTML):
<img src={signedUrl} alt="User uploaded diagram" />
```

## Dependencies

### Internal

- **Supabase Client:** Browser client via `createClient()` (from `@/lib/supabase/client`).
- **Types:** File, UUID generation (Web Crypto API).

### External

- **Supabase Storage:** `note-images` bucket must be created and accessible to authenticated users.
- **Web Crypto API:** `crypto.randomUUID()` (native, no npm dependency).

---

**Last Updated:** 2026-04-02

**For notes system design, consult `.claude/docs/` in the repository root.**
