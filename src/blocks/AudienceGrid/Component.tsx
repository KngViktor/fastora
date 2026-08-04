import React from 'react'

import { SectionHeading } from '@/components/SectionHeading'

type Props = {
  eyebrow?: string | null
  heading?: string | null
  description?: string | null
  items?: { label: string }[]
}

/**
 * A wrapped row of pills, for lists where each entry is a short label rather
 * than a heading with prose — the kinds of organisation Fastora works with, for
 * instance. Nine two-word items in a definition list would read as nine empty
 * rows; as pills they scan in one glance and wrap naturally on narrow screens.
 */
export const AudienceGridBlock: React.FC<Props> = ({ eyebrow, heading, description, items }) => {
  if (!items?.length) return null

  return (
    <section className="container py-20 md:py-28">
      <div className="max-w-2xl">
        <SectionHeading eyebrow={eyebrow} heading={heading} />
        {description && (
          <p data-reveal="up" className="mt-4 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <ul className="mt-10 flex flex-wrap gap-3" data-reveal-group="60">
        {items.map((item, i) => (
          <li
            key={i}
            data-reveal="up"
            className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground"
          >
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  )
}
