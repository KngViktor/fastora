import React from 'react'

import { SectionHeading } from '@/components/SectionHeading'

import { ConsultationFormClient } from './ConsultationFormClient'

type Props = {
  eyebrow?: string | null
  heading?: string | null
  description?: string | null
  idealFor?: { label: string }[]
  submitLabel?: string | null
  reassurance?: string | null
  /** Anchor target, so a button further up the page can scroll to the form. */
  id?: string
  /** Fixes the form to one service. Set on service pages, absent on the CMS block. */
  service?: { id: number; title: string } | null
}

/**
 * Server wrapper: heading and copy render on the server, only the form itself is
 * a client component. Every string is editable in the admin, including the button
 * label and the line under it.
 */
export const ConsultationFormBlock: React.FC<Props> = ({
  eyebrow,
  heading,
  description,
  idealFor,
  submitLabel,
  reassurance,
  id,
  service = null,
}) => {
  return (
    <section id={id} className="container scroll-mt-24 py-12 md:py-16">
      <div className="max-w-2xl">
        <SectionHeading eyebrow={eyebrow} heading={heading} />
        {description && (
          <p data-reveal="up" className="mt-4 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <div className="mt-12">
        <ConsultationFormClient
          service={service}
          idealFor={idealFor ?? []}
          submitLabel={submitLabel || 'Request a session'}
          reassurance={
            reassurance ||
            "We'll confirm one of your preferred times by email within one business day."
          }
        />
      </div>
    </section>
  )
}
