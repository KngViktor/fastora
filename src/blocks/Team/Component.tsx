import React from 'react'

import type { Media as MediaType } from '@/lib/api'
import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/SectionHeading'

type Member = {
  name: string
  role?: string | null
  bio?: string | null
  photo?: MediaType | null
}

type Props = {
  eyebrow?: string | null
  heading?: string | null
  description?: string | null
  members?: Member[]
}

/** "AE", "Kator Tarkaa" -> "KT". Matches the fallback avatar testimonials use. */
function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

/**
 * Team roster. A member without a photo still shows, as initials on a
 * brand-tinted circle, so the section can go live before headshots are
 * collected — the same reasoning TrustedBy applies to a client with no logo.
 */
export const TeamBlock: React.FC<Props> = ({ eyebrow, heading, description, members }) => {
  if (!members?.length) return null

  return (
    <section className="container py-20 md:py-28">
      <SectionHeading eyebrow={eyebrow} heading={heading} />
      {description && (
        <p data-reveal="up" className="mt-4 max-w-2xl text-muted-foreground">
          {description}
        </p>
      )}

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3" data-reveal-group="120">
        {members.map((member, i) => (
          <div
            key={i}
            data-reveal="up"
            className="rounded-3xl border border-border bg-card p-8"
          >
            {member.photo && typeof member.photo === 'object' ? (
              <div className="h-16 w-16 overflow-hidden rounded-full">
                <Media resource={member.photo} imgClassName="h-full w-full object-cover" />
              </div>
            ) : (
              <span
                aria-hidden="true"
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-lg font-semibold text-secondary"
              >
                {initials(member.name)}
              </span>
            )}

            <h3 className="mt-5 text-lg font-semibold">{member.name}</h3>
            {member.role && <p className="mt-0.5 text-sm text-secondary">{member.role}</p>}
            {member.bio && <p className="mt-3 text-sm text-muted-foreground">{member.bio}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
