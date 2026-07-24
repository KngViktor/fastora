'use client'

import React, { useEffect, useRef } from 'react'

import type { Media as MediaType } from '@/payload-types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

type Props = {
  resource: MediaType
  trackRef: React.RefObject<HTMLElement | null>
  className?: string
}

/**
 * Bare scroll-scrubbed `<video>` — no wrapper markup of its own, so the
 * parent can position it as a plain background layer. `trackRef` points at
 * whatever tall ancestor defines the scroll range: as that element scrolls
 * past, the video's currentTime is driven directly by scroll position
 * (playing forward on the way down, reversing on the way back up) instead
 * of autoplaying on a timer.
 */
export const HeroScrollVideo: React.FC<Props> = ({ resource, trackRef, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    const track = trackRef.current
    if (!video || !track) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let duration = 0
    let ticking = false

    const onLoadedMetadata = () => {
      duration = video.duration || 0
    }
    video.addEventListener('loadedmetadata', onLoadedMetadata)
    if (video.readyState >= 1) duration = video.duration || 0

    if (prefersReducedMotion) {
      // Respect the user's motion preference: play through normally instead.
      video.muted = true
      video.loop = true
      video.play().catch(() => {})
      return () => video.removeEventListener('loadedmetadata', onLoadedMetadata)
    }

    const updateFromScroll = () => {
      ticking = false
      if (!duration) return

      const rect = track.getBoundingClientRect()
      const scrollableDistance = rect.height - window.innerHeight
      if (scrollableDistance <= 0) return

      const progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1)
      const targetTime = progress * duration

      if (Number.isFinite(targetTime) && Math.abs(video.currentTime - targetTime) > 0.01) {
        video.currentTime = targetTime
      }
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(updateFromScroll)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    updateFromScroll()

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      window.removeEventListener('scroll', onScroll)
    }
  }, [trackRef])

  return (
    <video
      ref={videoRef}
      className={className}
      muted
      playsInline
      preload="auto"
      aria-label={resource.alt || 'Fastora product preview'}
    >
      <source src={getMediaUrl(resource.url, resource.updatedAt)} type={resource.mimeType || 'video/mp4'} />
    </video>
  )
}
