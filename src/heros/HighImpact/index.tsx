import React from 'react'
import Image from 'next/image'

import type { HeroData } from '@/heros/types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

/**
 * High-impact hero — dark navy, editorial.
 * Static two-layer composite matching the brand reference: a fixed
 * gradient/wordmark background (bundled asset, not CMS content — brand
 * chrome, same idea as a favicon) plus an optional diagonally-cropped team
 * photo layered on top, swappable via the page's hero media in the admin.
 * The photo is hidden on mobile (no room for it once the text stack takes
 * over), where only the background gradient shows behind the text.
 */
export const HighImpactHero: React.FC<HeroData> = ({ links, media, richText }) => {
  const hasPhoto = Boolean(media && typeof media === 'object')

  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="relative min-h-[36rem] w-full md:min-h-[42rem] lg:min-h-[48rem]">
        <Image
          src="/hero/hero-bg.png"
          alt=""
          fill
          priority
          className="object-cover"
          aria-hidden="true"
        />

        {hasPhoto && (
          <div className="absolute inset-0 hidden md:block">
            <Media resource={media} fill imgClassName="object-cover" priority />
          </div>
        )}

        <div className="relative z-10 flex min-h-[36rem] w-full items-center md:min-h-[42rem] lg:min-h-[48rem]">
          <div
            className="w-full max-w-xl pt-32 pb-16 pl-8 pr-6 md:max-w-lg md:pt-0 md:pb-0 md:pl-12 lg:max-w-2xl lg:pl-16"
            data-reveal-group="120"
          >
            <div className="flex flex-col gap-6">
              {/* eyebrow */}
              <div
                data-reveal="up"
                className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-secondary"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                >
                  <path d="M10 0l2.245 6.91h7.265l-5.878 4.27 2.245 6.91L10 13.82l-5.877 4.27 2.245-6.91L.49 6.91h7.265z" />
                </svg>
                <span>Communications & Digital Strategy</span>
              </div>

              {richText && (
                <div data-reveal="up">
                  <RichText
                    className="max-w-2xl [&_h1]:text-5xl [&_h1]:font-semibold [&_h1]:leading-[1.05] [&_h1]:text-primary-foreground md:[&_h1]:text-6xl lg:[&_h1]:text-7xl [&_p]:mt-6 [&_p]:max-w-md [&_p]:text-lg [&_p]:text-primary-foreground/70"
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
        </div>
      </div>
    </section>
  )
}
