import React from 'react'

import { SectionHeading } from '@/components/SectionHeading'
import { cn } from '@/utilities/ui'

type Props = {
  heading?: string | null
  points?: { stat: string; title: string; description: string }[]
}

/** Parse "89%" / "150+" into { value, suffix } for the count-up animation. */
function parseStat(stat: string): { value: number; suffix: string } | null {
  const match = /^(\d+)(\D*)$/.exec(stat.trim())
  if (!match) return null
  return { value: Number(match[1]), suffix: match[2] }
}

/**
 * Alternating wide/narrow spans across a 3-column grid, so the row always
 * fills exactly (2+1, then 1+2, ...) and an odd final card runs full width.
 * Avoids both the three-equal-cards look and empty trailing cells at any
 * point count.
 */
function spanFor(index: number, total: number): string {
  if (index === total - 1 && total % 2 === 1) return 'lg:col-span-3'
  return index % 2 === 0 ? 'lg:col-span-2' : 'lg:col-span-1'
}

export const WhyFastoraBlock: React.FC<Props> = ({ heading, points }) => {
  if (!points?.length) return null

  return (
    <section className="container py-20 md:py-28">
      <SectionHeading heading={heading} />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-reveal-group="110">
        {points.map((point, i) => {
          const parsed = point.stat ? parseStat(point.stat) : null
          // The lead stat carries the brand gradient; the rest stay quiet so
          // one number owns the section instead of three competing.
          const accent = i === 0
          return (
            <div
              key={i}
              data-reveal="up"
              className={cn(
                'flex flex-col justify-between rounded-3xl p-8 sm:col-span-2 lg:col-span-1',
                spanFor(i, points.length),
                accent
                  ? 'bg-gradient-velocity text-accent-foreground'
                  : 'border border-border bg-card',
              )}
            >
              <p
                className={cn(
                  'font-display text-5xl font-bold md:text-6xl',
                  // On the gradient card the figure stays white for contrast;
                  // elsewhere gold marks it as a claim rather than a link.
                  !accent && 'text-gold',
                )}
              >
                {parsed ? (
                  <span data-count={parsed.value} data-count-suffix={parsed.suffix}>
                    0{parsed.suffix}
                  </span>
                ) : (
                  point.stat
                )}
              </p>
              <div className="mt-8">
                <h3 className="text-lg font-semibold">{point.title}</h3>
                <p
                  className={cn(
                    'mt-2 max-w-md text-sm',
                    accent ? 'text-accent-foreground/80' : 'text-muted-foreground',
                  )}
                >
                  {point.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
