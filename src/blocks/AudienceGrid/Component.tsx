import React from 'react'

import { SectionHeading } from '@/components/SectionHeading'

type Props = {
  heading?: string | null
  items?: { title: string; description: string }[]
}

/** Layout family: two-column definition list, no cards. */
export const AudienceGridBlock: React.FC<Props> = ({ heading, items }) => {
  if (!items?.length) return null

  return (
    <section className="container py-20 md:py-28">
      <SectionHeading heading={heading} />

      <dl
        className="mt-12 grid gap-x-12 gap-y-10 border-t border-border pt-10 md:grid-cols-2"
        data-reveal-group="60"
      >
        {items.map((item, i) => (
          <div key={i} data-reveal="up">
            <dt className="text-lg font-semibold">{item.title}</dt>
            <dd className="mt-2 max-w-md text-sm text-muted-foreground">{item.description}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
