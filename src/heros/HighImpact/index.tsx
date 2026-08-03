import { Sparkle } from 'lucide-react'
import React from 'react'

import type { HeroData } from '@/heros/types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

/**
 * High-impact hero — dark navy, editorial.
 * The gradient background, ghosted "FASTORA" wordmark, and diagonally-cut
 * team photo are one single pre-composited image (the page's hero media,
 * swappable in the admin) rather than two separately-cropped layers —
 * that avoids any seam/alignment drift between the background and the
 * photo at different viewport widths. It's a landscape composition, so on
 * mobile it's dropped entirely in favour of a plain navy background,
 * keeping the hero a normal vertical stack (eyebrow, heading, subtext,
 * buttons) instead of a cropped, squeezed version of the desktop layout.
 */
export const HighImpactHero: React.FC<HeroData> = ({ eyebrow, links, media, richText }) => {
  const hasImage = Boolean(media && typeof media === 'object')

  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="relative w-full md:min-h-[42rem] lg:min-h-[48rem]">
        {hasImage && (
          <div className="absolute inset-0 hidden md:block">
            <Media resource={media} fill imgClassName="object-cover" priority />
          </div>
        )}

        <div className="relative z-10 flex w-full md:min-h-[42rem] md:items-center lg:min-h-[48rem]">
          <div
            className="w-full max-w-xl pt-24 pb-16 pl-8 pr-6 md:max-w-xl md:pt-0 md:pb-0 md:pl-12 lg:max-w-4xl lg:pl-16"
            data-reveal-group="120"
          >
            <div className="flex flex-col gap-6">
              {/* eyebrow */}
              {eyebrow && (
                <div
                  data-reveal="up"
                  className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-gold-on-dark"
                >
                  <Sparkle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
                  <span>{eyebrow}</span>
                </div>
              )}

              {richText && (
                <div data-reveal="up">
                  <RichText
                    className="max-w-4xl [&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:leading-[1.05] [&_h1]:break-words [&_h1]:text-primary-foreground sm:[&_h1]:text-5xl lg:[&_h1]:text-6xl [&_p]:mt-6 [&_p]:max-w-md [&_p]:text-lg [&_p]:text-primary-foreground/70"
                    data={richText}
                    enableGutter={false}
                  />
                </div>
              )}

              {Array.isArray(links) && links.length > 0 && (
                <ul data-reveal="up" className="mt-4 flex flex-wrap gap-4">
                  {links.map((link, i) => (
                    <li key={i}>
                      <CMSLink
                        label={link.label}
                        url={link.url}
                        appearance={link.appearance as 'default' | 'outline' | undefined}
                        size="lg"
                        className={cn(
                          'rounded-full px-8 text-base font-semibold',
                          link.appearance === 'outline'
                            ? 'border-2 border-secondary bg-transparent text-primary-foreground hover:bg-secondary/10 hover:text-secondary'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
                        )}
                      />
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
