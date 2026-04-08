'use client'

import { useState, useCallback, useEffect } from 'react'
import { UploadSimple, File, XCircle, CheckCircle, Warning } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import { uploadAssetFile, createAsset } from '@/lib/actions/admin/assets'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface AssetMetadata {
  system: string
  layer: string
  discipline: string
  tags: string[]
}

const systemOptions = ['structural', 'mep', 'architectural', 'civil']
const layerOptions = ['foundation', 'frame', 'envelope', 'core', 'roof']
const disciplineOptions = ['LEA', 'PNLE', 'BAR']

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
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Simulated progress
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isUploading && uploadProgress < 90) {
      interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + Math.random() * 10, 90))
      }, 500)
    }
    return () => clearInterval(interval)
  }, [isUploading, uploadProgress])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.name.endsWith('.glb') || droppedFile.name.endsWith('.gltf'))) {
      setFile(droppedFile)
      setName(droppedFile.name.replace(/\.(glb|gltf)$/, ''))
      setError(null)
      setSuccess(false)
      setUploadProgress(0)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setName(selectedFile.name.replace(/\.(glb|gltf)$/, ''))
      setError(null)
      setSuccess(false)
      setUploadProgress(0)
    }
  }, [])

  const handleUpload = async () => {
    if (!file || !name || !metadata.system || !metadata.layer) {
      setError('Please fill in all required fields')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
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

      setUploadProgress(100)
      setSuccess(true)
      
      // Delay reset slightly so user sees 100%
      setTimeout(() => {
        setFile(null)
        setName('')
        setMetadata({ system: '', layer: '', discipline: '', tags: [] })
        setUploadProgress(0)
      }, 1000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploadProgress(0)
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
              disabled={isUploading}
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
              disabled={isUploading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">System *</label>
              <Select
                value={metadata.system}
                onValueChange={(val) => setMetadata(m => ({ ...m, system: val }))}
                disabled={isUploading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select system..." />
                </SelectTrigger>
                <SelectContent>
                  {systemOptions.map(s => (
                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Layer *</label>
              <Select
                value={metadata.layer}
                onValueChange={(val) => setMetadata(m => ({ ...m, layer: val }))}
                disabled={isUploading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select layer..." />
                </SelectTrigger>
                <SelectContent>
                  {layerOptions.map(l => (
                    <SelectItem key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Discipline</label>
            <Select
              value={metadata.discipline}
              onValueChange={(val) => setMetadata(m => ({ ...m, discipline: val }))}
              disabled={isUploading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select discipline..." />
              </SelectTrigger>
              <SelectContent>
                {disciplineOptions.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-destructive">
              <SCIcon icon={Warning} size="sm" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 text-emerald">
              <SCIcon icon={CheckCircle} size="sm" />
              <p className="text-sm">Asset uploaded successfully!</p>
            </div>
          )}

          {/* Upload Button & Progress */}
          <div className="space-y-2">
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              fullWidth
              loading={isUploading}
              leftIcon={<SCIcon icon={UploadSimple} size="sm" />}
            >
              {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload Asset'}
            </Button>
            {isUploading && (
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
