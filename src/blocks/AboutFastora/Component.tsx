import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import React from 'react'

import type { Media as MediaType } from '@/lib/api'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

type Props = {
  heading?: string | null
  richText?: string | null
  image?: MediaType | null
  linkLabel?: string | null
  linkUrl?: string | null
  stats?: { value: string; label: string }[]
}

/**
 * Layout family: offset image / text split. The image sits in a narrower
 * column and runs slightly taller than the copy beside it, so the section
 * reads as composed rather than as another 50/50 row.
 */
export const AboutFastoraBlock: React.FC<Props> = ({
  heading,
  richText,
  image,
  linkLabel,
  linkUrl,
  stats,
}) => {
  if (!heading && !richText) return null

  return (
    <section className="container py-12 md:py-16">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20">
        {image && typeof image === 'object' && (
          <div data-reveal="scale" className="relative order-last lg:order-first">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border bg-muted">
              <Media resource={image} fill imgClassName="object-cover" />
            </div>
          </div>
        )}

        <div data-reveal-group="90">
          {heading && (
            <h2
              data-reveal="up"
              className="max-w-xl text-3xl font-semibold leading-[1.15] md:text-5xl"
            >
              {heading}
            </h2>
          )}

          {richText && (
            <div data-reveal="up" className="mt-6 max-w-xl [&_p]:mt-4 [&_p]:text-muted-foreground">
              <RichText data={richText} enableGutter={false} enableProse={false} />
            </div>
          )}

          {Array.isArray(stats) && stats.length > 0 && (
            <dl
              data-reveal="up"
              className="mt-10 flex flex-wrap gap-x-12 gap-y-6 border-t border-border pt-8"
            >
              {stats.map((stat, i) => (
                <div key={i}>
                  <dt className="font-display text-3xl font-semibold text-gold md:text-4xl">
                    {stat.value}
                  </dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{stat.label}</dd>
                </div>
              ))}
            </dl>
          )}

          {linkLabel && linkUrl && (
            <Link
              href={linkUrl}
              data-reveal="up"
              className="group mt-10 inline-flex items-center gap-2 text-sm font-medium text-secondary transition-colors hover:text-foreground"
            >
              {linkLabel}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
