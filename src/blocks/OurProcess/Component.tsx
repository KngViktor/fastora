import React from 'react'

type Props = {
  eyebrow?: string | null
  heading?: string | null
  steps?: { title: string; description: string }[]
}

export const OurProcessBlock: React.FC<Props> = ({ eyebrow, heading, steps }) => {
  if (!steps?.length) return null

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

      <ol className="mt-14 grid gap-10 md:grid-cols-2 md:gap-x-8 md:gap-y-14 lg:grid-cols-4" data-reveal-group="110">
        {steps.map((step, i) => (
          <li key={i} data-reveal="up" className="relative flex flex-col gap-3 border-t-2 border-secondary/30 pt-6">
            <span className="font-display text-3xl font-semibold text-secondary/50">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
