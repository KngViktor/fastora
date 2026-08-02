import React from 'react'

type Props = {
  eyebrow?: string | null
  heading?: string | null
  items?: { title: string; description: string }[]
}

export const AudienceGridBlock: React.FC<Props> = ({ eyebrow, heading, items }) => {
  if (!items?.length) return null

  return (
    <section className="container py-20 md:py-28">
      <div className="max-w-2xl" data-reveal="up">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            {eyebrow}
          </span>
        )}
        {heading && <h2 className="mt-3 text-3xl font-semibold md:text-5xl">{heading}</h2>}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-reveal-group="60">
        {items.map((item, i) => (
          <div
            key={i}
            data-reveal="up"
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h3 className="text-base font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
