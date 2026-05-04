/**
 * ArticleMedia — Reusable media component for Slatecamp wiki articles.
 *
 * MDX-friendly flat props syntax (article content is stored as text):
 *
 * Single image:
 *   <ArticleMedia id="media-example" layout="single" type="image" alt="Diagram showing..." caption="..." suggestedAsset="..." />
 *
 * Carousel:
 *   <ArticleMedia id="media-carousel" layout="carousel" type="image" carouselCount="3" alt="Sequence of..." caption="Image N of..." />
 *
 * YouTube embed:
 *   <ArticleMedia id="media-video" layout="embed" type="youtube" caption="Walkthrough of..." />
 *
 * Supports future-ready: swap status="placeholder" → status="ready" + src/youtubeId
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'

// ── Types ──────────────────────────────────────────────────────────

export type ArticleMediaLayout = 'single' | 'carousel' | 'gallery' | 'embed'
export type ArticleMediaVariant = 'default' | 'wide' | 'contained' | 'inline' | 'hero'
export type ArticleMediaType = 'image' | 'youtube' | 'video' | 'embed'
export type AspectRatio = '16:9' | '4:3' | '3:2' | '1:1' | 'auto'

export interface ArticleMediaProps {
  id: string
  layout?: ArticleMediaLayout
  variant?: ArticleMediaVariant
  aspectRatio?: AspectRatio
  title?: string
  description?: string
  placementIntent?: string

  // Single-item props
  type?: ArticleMediaType
  status?: 'placeholder' | 'ready'
  src?: string
  youtubeId?: string
  embedUrl?: string
  alt?: string
  caption?: string
  credit?: string
  sourceUrl?: string
  suggestedAsset?: string
  suggestedSearchQuery?: string
  replacementNotes?: string

  // Carousel props
  carouselCount?: number
}

// ── Aspect ratio helper ─────────────────────────────────────────────

const aspectRatioMap: Record<AspectRatio, string> = {
  '16:9': '56.25%',
  '4:3': '75%',
  '3:2': '66.67%',
  '1:1': '100%',
  'auto': 'auto',
}

// ── Placeholder icon/label per type ────────────────────────────────

const typeIcon: Record<string, string> = {
  image: '🖼',
  youtube: '▶',
  video: '🎬',
  embed: '🔗',
}

const typeLabel: Record<string, string> = {
  image: 'Image',
  youtube: 'YouTube',
  video: 'Video',
  embed: 'Embed',
}

// ── Single placeholder item ────────────────────────────────────────

const PlaceholderView = ({
  type,
  alt,
  caption,
  suggestedAsset,
  replacementNotes,
  aspectRatio,
  itemIndex,
}: {
  type: string
  alt?: string
  caption?: string
  suggestedAsset?: string
  replacementNotes?: string
  aspectRatio: AspectRatio
  itemIndex?: number
}) => {
  const padStyle: React.CSSProperties =
    aspectRatio !== 'auto'
      ? { paddingBottom: aspectRatioMap[aspectRatio], position: 'relative' as const }
      : { minHeight: 120 }

  return (
    <div
      className="not-prose relative overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/30"
      role="region"
      aria-label={`${typeLabel[type] || 'Media'} placeholder${itemIndex !== undefined ? ` ${itemIndex + 1}` : ''}: ${alt || caption || 'Media slot'}`}
    >
      <div style={padStyle}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <span className="mb-2 text-2xl" aria-hidden="true">{typeIcon[type] || '📎'}</span>
          <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {typeLabel[type] || 'Media'} Placeholder{itemIndex !== undefined ? ` ${itemIndex + 1}` : ''}
          </span>
          {alt && (
            <p className="mb-1 max-w-md text-sm text-foreground/80">
              {alt}
            </p>
          )}
          {suggestedAsset && (
            <p className="mb-1 text-xs text-muted-foreground">
              <span className="font-medium">Suggested asset:</span> {suggestedAsset}
            </p>
          )}
          {replacementNotes && (
            <p className="text-xs italic text-muted-foreground/70">
              {replacementNotes}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Ready item (image / YouTube / embed) ───────────────────────────

const ReadyView = ({
  type,
  src,
  youtubeId,
  embedUrl,
  alt,
  caption,
  credit,
  sourceUrl,
  aspectRatio,
}: {
  type: string
  src?: string
  youtubeId?: string
  embedUrl?: string
  alt?: string
  caption?: string
  credit?: string
  sourceUrl?: string
  aspectRatio: AspectRatio
}) => {
  const padStyle: React.CSSProperties =
    aspectRatio !== 'auto'
      ? { paddingBottom: aspectRatioMap[aspectRatio], position: 'relative' as const }
      : { minHeight: 200 }

  if (type === 'youtube' && youtubeId) {
    return (
      <figure className="not-prose">
        <div className="relative overflow-hidden rounded-lg" style={padStyle}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
            title={caption || 'YouTube video'}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
        {caption && <figcaption className="mt-1.5 text-center text-xs text-muted-foreground">{caption}</figcaption>}
      </figure>
    )
  }

  if (type === 'embed' && embedUrl) {
    return (
      <figure className="not-prose">
        <div className="relative overflow-hidden rounded-lg" style={padStyle}>
          <iframe
            src={embedUrl}
            title={caption || 'Embedded content'}
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            allow="fullscreen"
          />
        </div>
        {caption && <figcaption className="mt-1.5 text-center text-xs text-muted-foreground">{caption}</figcaption>}
      </figure>
    )
  }

  if (type === 'image' && src) {
    return (
      <figure className="not-prose">
        <div className="relative overflow-hidden rounded-lg" style={padStyle}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || caption || 'Article image'}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        {(caption || credit || sourceUrl) && (
          <figcaption className="mt-1.5 text-center text-xs text-muted-foreground">
            {caption && <span>{caption}</span>}
            {credit && <span className="ml-1 text-muted-foreground/60">— {credit}</span>}
            {sourceUrl && (
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-2 underline hover:text-foreground">
                Source
              </a>
            )}
          </figcaption>
        )}
      </figure>
    )
  }

  // Fallback: marked ready but missing data → placeholder
  return (
    <PlaceholderView
      type={type}
      alt={`Ready but missing source data. ${alt || ''}`}
      suggestedAsset={src ? 'Check src URL' : 'Add src or youtubeId'}
      aspectRatio={aspectRatio}
    />
  )
}

// ── Main component ────────────────────────────────────────────────

const ArticleMedia = ({
  id,
  layout = 'single',
  variant = 'default',
  aspectRatio = '16:9',
  title,
  description,
  placementIntent,
  type = 'image',
  status = 'placeholder',
  src,
  youtubeId,
  embedUrl,
  alt,
  caption,
  credit,
  sourceUrl,
  suggestedAsset,
  _suggestedSearchQuery,
  replacementNotes,
  carouselCount,
}: ArticleMediaProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const isCarousel = layout === 'carousel' || layout === 'gallery'
  const count = isCarousel && carouselCount ? carouselCount : 1
  const showControls = isCarousel && count > 1

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % count)
  }, [count])
  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + count) % count)
  }, [count])

  // Variant width classes
  const variantClass: Record<ArticleMediaVariant, string> = {
    default: '',
    wide: 'lg:-mx-8',
    contained: 'max-w-lg mx-auto',
    inline: 'max-w-sm float-right ml-4 mb-2',
    hero: 'lg:-mx-8 lg:my-8',
  }

  const containerClass = useMemo(() => {
    const classes = ['not-prose my-6', variantClass[variant]]
    if (variant === 'inline') classes.push('clear-right')
    return classes.join(' ')
  }, [variant])

  const _headingId = useMemo(() => `media-${id}`, [id])

  return (
    <section className={containerClass} aria-label={title || 'Article media'} data-media-block-id={id}>
      {/* Title + description */}
      {title && <h4 className="mb-1 text-sm font-semibold text-foreground">{title}</h4>}
      {description && <p className="mb-3 text-xs text-muted-foreground">{description}</p>}

      {/* Carousel: show current item */}
      {isCarousel && count > 1 ? (
        <>
          {status === 'ready' ? (
            <ReadyView
              type={type}
              src={src}
              youtubeId={youtubeId}
              embedUrl={embedUrl}
              alt={alt ? `${alt} (${currentIndex + 1}/${count})` : undefined}
              caption={caption ? `${caption} (${currentIndex + 1}/${count})` : undefined}
              credit={credit}
              sourceUrl={sourceUrl}
              aspectRatio={aspectRatio}
            />
          ) : (
            <PlaceholderView
              type={type}
              alt={alt ? `${alt} (Image ${currentIndex + 1} of ${count})` : `Carousel item ${currentIndex + 1} of ${count}`}
              caption={caption}
              suggestedAsset={suggestedAsset}
              replacementNotes={replacementNotes}
              aspectRatio={aspectRatio}
              itemIndex={currentIndex}
            />
          )}
        </>
      ) : (
        /* Single item */
        status === 'ready' ? (
          <ReadyView
            type={type}
            src={src}
            youtubeId={youtubeId}
            embedUrl={embedUrl}
            alt={alt}
            caption={caption}
            credit={credit}
            sourceUrl={sourceUrl}
            aspectRatio={aspectRatio}
          />
        ) : (
          <PlaceholderView
            type={type}
            alt={alt}
            caption={caption}
            suggestedAsset={suggestedAsset}
            replacementNotes={replacementNotes}
            aspectRatio={aspectRatio}
          />
        )
      )}

      {/* Carousel controls */}
      {showControls && (
        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-1">
            {Array.from({ length: count }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-primary' : 'bg-border hover:bg-muted-foreground'
                }`}
                aria-label={`Go to item ${idx + 1}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={goPrev}
              className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
              aria-label="Previous media item"
            >
              ← Prev
            </button>
            <button
              onClick={goNext}
              className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
              aria-label="Next media item"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Placement intent note — only in placeholder mode */}
      {placementIntent && status !== 'ready' && (
        <p className="mt-2 text-xs italic text-muted-foreground/50">
          Placement intent: {placementIntent}
        </p>
      )}
    </section>
  )
}

export default ArticleMedia
export { ArticleMedia }
