import React from 'react'

import { SectionHeading } from '@/components/SectionHeading'
import { cn } from '@/utilities/ui'

type Props = {
  eyebrow?: string | null
  heading?: string | null
  points?: { stat: string; title: string; description: string }[]
}

/** Parse "89%" / "150+" into { value, suffix } for the count-up animation. */
function parseStat(stat: string): { value: number; suffix: string } | null {
  const match = /^(\d+)(\D*)$/.exec(stat.trim())
  if (!match) return null
  return { value: Number(match[1]), suffix: match[2] }
}

export const WhyFastoraBlock: React.FC<Props> = ({ eyebrow, heading, points }) => {
  if (!points?.length) return null

  return (
    <section className="container py-20 md:py-28">
      <SectionHeading eyebrow={eyebrow} heading={heading} />

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-reveal-group="110">
        {points.map((point, i) => {
          const parsed = point.stat ? parseStat(point.stat) : null
          // The lead card inverts: brand gradient behind white text, the rest
          // are bordered cards whose figure carries the gradient instead.
          const accent = i === 0
          return (
            <div
              key={i}
              data-reveal="up"
              className={cn(
                'rounded-3xl p-8',
                accent
                  ? 'bg-gradient-velocity text-accent-foreground'
                  : 'border border-border bg-card',
              )}
            >
              <p
                className={cn(
                  'font-display text-5xl font-bold md:text-6xl',
                  !accent && 'text-gradient-velocity',
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
              <div className="mt-5">
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
