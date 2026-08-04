import Link from 'next/link'
import React from 'react'

import { cn } from '@/utilities/ui'

type Props = {
  heading?: string | null
  /** Small uppercase label above the heading, e.g. "What we do". */
  eyebrow?: string | null
  /** Optional trailing link, rendered inline with the heading on desktop. */
  action?: { label: string; href: string } | null
  /** Use on the dark navy sections so contrast stays correct. */
  tone?: 'light' | 'dark'
  className?: string
}

/**
 * Shared heading for content sections: eyebrow, heading, and an optional
 * trailing link.
 *
 * The eyebrow is driven entirely by the CMS. The API has always sent one for
 * every block, so a section shows a label only if an editor has written one,
 * and clearing the field in the admin removes it without a deploy.
 */
export const SectionHeading: React.FC<Props> = ({
  heading,
  eyebrow,
  action,
  tone = 'light',
  className,
}) => {
  if (!heading && !action && !eyebrow) return null

  const linkTone =
    tone === 'dark'
      ? 'text-primary-foreground/70 hover:text-primary-foreground'
      : 'text-muted-foreground hover:text-foreground'

  return (
    <div
      className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}
    >
      <div data-reveal="up">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            {eyebrow}
          </span>
        )}
        {heading && (
          <h2 className={cn('max-w-xl text-3xl font-semibold md:text-5xl', eyebrow && 'mt-3')}>
            {heading}
          </h2>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          data-reveal="up"
          className={cn(
            'group inline-flex shrink-0 items-center gap-2 text-sm font-medium transition-colors',
            linkTone,
          )}
        >
          {action.label}
          <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">
            →
          </span>
        </Link>
      )}
    </div>
  )
}
