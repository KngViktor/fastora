'use client'

import React, { useEffect, useRef, useState } from 'react'

import type { HeroData } from '@/heros/types'

import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'
import { HeroScrollVideo } from './HeroScrollVideo'

const DESKTOP_QUERY = '(min-width: 768px)'

/**
 * High-impact hero — dark navy, editorial.
 * Without a hero video: a soft gold glow and an oversized "FASTORA"
 * wordmark anchor the section, mirroring the reference layout.
 * With a hero video: the video plays as a raw background layer directly
 * behind the headline/CTAs (no scrim, no wordmark) and is scrubbed by
 * scroll position rather than autoplaying (see HeroScrollVideo).
 * Desktop-only: on mobile the <video> is never mounted (no fetch, no
 * scroll listener), and the hero falls back to the plain glow/wordmark
 * treatment instead.
 *
 * Important: this renders a single, structurally stable tree — the
 * text/CTA block (`content`) always sits in the same DOM position,
 * only the decorative background (video vs glow) swaps inside it. An
 * earlier version used two separate `return` branches for the video vs
 * non-video cases, which are different top-level trees; switching
 * between them (e.g. once the desktop media query resolves after
 * mount) made React unmount and remount `content` entirely. The
 * scroll-reveal fade-in only observes elements once on initial mount,
 * so the remounted text/buttons never got observed and stayed stuck at
 * opacity: 0 forever. Keeping one tree avoids that.
 */
export const HighImpactHero: React.FC<HeroData> = ({ links, media, richText }) => {
  const trackRef = useRef<HTMLElement>(null)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    setIsDesktop(mql.matches)
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const hasVideo =
    isDesktop && Boolean(media && typeof media === 'object' && media.mimeType?.includes('video'))

  const content = (
    <>
      <div
        className="relative z-10 w-full pl-8 pr-6 pt-32 pb-16 md:pl-12 md:pr-10 md:pt-44 md:pb-24"
        data-reveal-group="120"
      >
        <div className="flex flex-col gap-6">
          {/* eyebrow */}
          <div
            data-reveal="up"
            className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-secondary"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" aria-hidden="true" />
            <span>Communications & Digital Strategy</span>
          </div>

          {richText && (
            <div data-reveal="up" className="-ml-[0.6rem] md:-ml-[0.9rem]">
              <RichText
                className="max-w-4xl [&_h1]:text-5xl [&_h1]:font-semibold [&_h1]:leading-[1.02] [&_h1]:text-primary-foreground md:[&_h1]:text-7xl [&_p]:mt-6 [&_p]:max-w-xl [&_p]:text-lg [&_p]:text-primary-foreground/70"
                data={richText}
                enableGutter={false}
              />
            </div>
          )}

          {Array.isArray(links) && links.length > 0 && (
            <ul data-reveal="up" className="mt-4 flex flex-wrap gap-4">
              {links.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink {...link} size="lg" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {!hasVideo && (
        /* oversized wordmark — only shown when there's no hero video */
        <div
          data-reveal="mask"
          className="container relative z-10 select-none pb-10 md:pb-16"
          aria-hidden="true"
        >
          <span className="block bg-gradient-to-b from-primary-foreground/90 to-primary-foreground/25 bg-clip-text text-[24vw] font-bold leading-none tracking-tighter text-transparent">
            FASTORA
          </span>
        </div>
      )}
    </>
  )

  return (
    <section
      ref={trackRef}
      className={cn(
        'relative overflow-hidden bg-primary text-primary-foreground',
        hasVideo && 'h-[120vh]',
      )}
    >
      <div className={cn(hasVideo && 'sticky top-0 h-screen overflow-hidden')}>
        {hasVideo && media && typeof media === 'object' ? (
          <HeroScrollVideo
            resource={media}
            trackRef={trackRef}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            {/* ambient accent glow */}
            <div
              className="animate-float pointer-events-none absolute -top-24 right-[-10%] h-[38rem] w-[38rem] rounded-full opacity-70 blur-3xl"
              style={{
                background: 'radial-gradient(circle at center, rgba(198,161,91,0.28), transparent 62%)',
              }}
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
              }}
            />
          </>
        )}
        {content}
      </div>
    </section>
  )
}
