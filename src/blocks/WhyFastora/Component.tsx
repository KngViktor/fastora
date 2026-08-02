import React from 'react'

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
      <div className="max-w-2xl" data-reveal="up">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            {eyebrow}
          </span>
        )}
        {heading && <h2 className="mt-3 text-3xl font-semibold md:text-5xl">{heading}</h2>}
      </div>

      <div
        className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        data-reveal-group="110"
      >
        {points.map((point, i) => {
          const parsed = point.stat ? parseStat(point.stat) : null
          // First card gets the gradient accent treatment (like the reference).
          const accent = i === 0
          return (
            <div
              key={i}
              data-reveal="up"
              className={
                accent
                  ? 'rounded-3xl bg-gradient-velocity p-8 text-accent-foreground'
                  : 'rounded-3xl border border-border bg-card p-8'
              }
            >
              <p
                className={
                  accent
                    ? 'font-display text-5xl font-bold md:text-6xl'
                    : 'font-display text-5xl font-bold text-gradient-velocity md:text-6xl'
                }
              >
                {parsed ? (
                  <span data-count={parsed.value} data-count-suffix={parsed.suffix}>
                    0{parsed.suffix}
                  </span>
                ) : (
                  point.stat
                )}
              </p>
              <h3 className="mt-5 text-lg font-semibold">{point.title}</h3>
              <p
                className={
                  accent ? 'mt-2 text-sm text-accent-foreground/80' : 'mt-2 text-sm text-muted-foreground'
                }
              >
                {point.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
