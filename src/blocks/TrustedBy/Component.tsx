import React from 'react'

import type { Media as MediaType } from '@/lib/api'
import { Media } from '@/components/Media'

type Props = {
  heading?: string | null
  logos?: { media: MediaType | null; name: string }[]
}

/**
 * Client logo wall, sitting directly under the hero.
 *
 * Renders nothing until real logos are added, so the homepage never shows an
 * empty strip or placeholder marks implying clients that do not exist. Logos
 * only: no industry labels underneath, which add nothing a reader cannot see.
 */
export const TrustedByBlock: React.FC<Props> = ({ heading, logos }) => {
  const withMedia = (logos ?? []).filter((logo) => logo.media)

  if (withMedia.length === 0) return null

  return (
    <section className="border-y border-border bg-muted/40">
      <div className="container flex flex-col items-center gap-8 py-10 md:flex-row md:gap-14 md:py-12">
        {heading && (
          <p className="shrink-0 text-sm font-medium text-muted-foreground">{heading}</p>
        )}

        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:justify-start md:gap-x-14">
          {withMedia.map((logo, i) => (
            <li key={i}>
              <Media
                resource={logo.media}
                alt={logo.name}
                htmlElement={null}
                imgClassName="h-7 w-auto object-contain opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0 md:h-8"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
