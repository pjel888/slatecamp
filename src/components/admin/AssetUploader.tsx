'use client'

import { useState, useCallback } from 'react'
import { UploadSimple, File, XCircle, CheckCircle, CircleNotch, Warning } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import { uploadAssetFile, createAsset } from '@/lib/actions/admin/assets'

interface AssetMetadata {
  system: string
  layer: string
  discipline: string
  tags: string[]
}

const systemOptions = ['structural', 'mep', 'architectural', 'civil']
const layerOptions = ['foundation', 'frame', 'envelope', 'core', 'roof']
const disciplineOptions = ['ALE', 'PNLE', 'BAR']

export const AssetUploader = () => {
  const [file, setFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<AssetMetadata>({
    system: '',
    layer: '',
    discipline: '',
    tags: [],
  })
  const [name, setName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.name.endsWith('.glb') || droppedFile.name.endsWith('.gltf'))) {
      setFile(droppedFile)
      setName(droppedFile.name.replace(/\.(glb|gltf)$/, ''))
      setError(null)
      setSuccess(false)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setName(selectedFile.name.replace(/\.(glb|gltf)$/, ''))
      setError(null)
      setSuccess(false)
    }
  }, [])

  const handleUpload = async () => {
    if (!file || !name || !metadata.system || !metadata.layer) {
      setError('Please fill in all required fields')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const { url, error: uploadError } = await uploadAssetFile(formData)
      if (uploadError || !url) throw new Error(uploadError ?? 'Upload failed')

      const { error: dbError } = await createAsset({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        url,
        metadata,
      })

      if (dbError) throw new Error(dbError.message)

      setSuccess(true)
      setFile(null)
      setName('')
      setMetadata({ system: '', layer: '', discipline: '', tags: [] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          "border-2 border-dashed rounded-md p-8 text-center transition-colors",
          file
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground"
        )}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <SCIcon icon={File} size="xl" className="text-primary" />
            <div className="text-left">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
            <button
              onClick={() => { setFile(null); setSuccess(false) }}
              className="ml-4 p-1 hover:bg-muted rounded"
            >
              <SCIcon icon={XCircle} size="sm" />
            </button>
          </div>
        ) : (
          <>
            <SCIcon icon={UploadSimple} size="xl" className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-1">
              Drop your .glb or .gltf file here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Maximum file size: 50MB
            </p>
            <input
              type="file"
              accept=".glb,.gltf"
              onChange={handleFileSelect}
              className="hidden"
              id="asset-upload"
            />
            <label
              htmlFor="asset-upload"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer text-sm font-medium"
            >
              Browse Files
            </label>
          </>
        )}
      </div>

      {/* Metadata Form */}
      {file && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Asset Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              placeholder="Enter asset name..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">System *</label>
              <select
                value={metadata.system}
                onChange={(e) => setMetadata(m => ({ ...m, system: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
              >
                <option value="">Select system...</option>
                {systemOptions.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Layer *</label>
              <select
                value={metadata.layer}
                onChange={(e) => setMetadata(m => ({ ...m, layer: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
              >
                <option value="">Select layer...</option>
                {layerOptions.map(l => (
                  <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Discipline</label>
            <select
              value={metadata.discipline}
              onChange={(e) => setMetadata(m => ({ ...m, discipline: e.target.value }))}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            >
              <option value="">Select discipline...</option>
              {disciplineOptions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600">
              <SCIcon icon={Warning} size="sm" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 text-green-600">
              <SCIcon icon={CheckCircle} size="sm" />
              <p className="text-sm">Asset uploaded successfully!</p>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <SCIcon icon={CircleNotch} size="sm" className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <SCIcon icon={UploadSimple} size="sm" />
                Upload Asset
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
