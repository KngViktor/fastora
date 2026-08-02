import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import React from 'react'

import { cn } from '@/utilities/ui'

type Props = {
  heading?: string | null
  /** Optional trailing link, rendered inline with the heading on desktop. */
  action?: { label: string; href: string } | null
  /** Use on the dark navy sections so contrast stays correct. */
  tone?: 'light' | 'dark'
  className?: string
}

/**
 * Shared heading for content sections.
 *
 * Deliberately has no "eyebrow" slot. Small uppercase labels above every
 * heading made all eight home-page sections read with the same templated
 * rhythm; the heading alone carries the section, and its position on the
 * page already says what it is. The eyebrow is kept only on the hero and
 * on PageHeader, where it labels the page rather than a section.
 */
export const SectionHeading: React.FC<Props> = ({
  heading,
  action,
  tone = 'light',
  className,
}) => {
  if (!heading && !action) return null

  const linkTone =
    tone === 'dark'
      ? 'text-primary-foreground/70 hover:text-primary-foreground'
      : 'text-muted-foreground hover:text-foreground'

  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between',
        className,
      )}
    >
      {heading && (
        <h2 data-reveal="up" className="max-w-2xl text-3xl font-semibold md:text-5xl">
          {heading}
        </h2>
      )}
      {action && (
        <Link
          href={action.href}
          data-reveal="up"
          className={cn(
            'group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium transition-colors',
            linkTone,
          )}
        >
          {action.label}
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  )
}
