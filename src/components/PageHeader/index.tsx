import React from 'react'

/**
 * Shared page header for list/detail routes. Dark band with an ambient glow
 * that matches the hero, an accent eyebrow, a large title, and optional lede.
 */
export const PageHeader: React.FC<{
  eyebrow?: string
  title: string
  description?: string
}> = ({ eyebrow, title, description }) => {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div
        className="animate-float pointer-events-none absolute -top-32 right-[-10%] h-[32rem] w-[32rem] rounded-full opacity-60 blur-3xl"
        style={{
          background: 'radial-gradient(circle at center, rgba(198,161,91,0.25), transparent 62%)',
        }}
      />
      <div className="container relative z-10 pt-28 pb-16 md:pt-36 md:pb-20" data-reveal-group="110">
        {eyebrow && (
          <span
            data-reveal="up"
            className="text-sm font-medium uppercase tracking-wide text-secondary"
          >
            {eyebrow}
          </span>
        )}
        <h1 data-reveal="up" className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.05] md:text-6xl">
          {title}
        </h1>
        {description && (
          <p data-reveal="up" className="mt-6 max-w-xl text-lg text-primary-foreground/70">
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
