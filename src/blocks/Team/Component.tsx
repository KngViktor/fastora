import Link from 'next/link'
import React from 'react'

import type { Media as MediaType, TeamMember } from '@/lib/api'
import { getTeamMembers, safely } from '@/lib/api'
import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/SectionHeading'

type Member = {
  name: string
  role?: string | null
  bio?: string | null
  photo?: MediaType | null
  /**
   * Where "View profile" goes, when it should not be worked out from the name.
   * Emmanuel is introduced here by his full name and his page is /genesis, so
   * there is nothing for the name match below to find.
   */
  profilePath?: string | null
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
export const TeamBlock: React.FC<Props> = async ({ eyebrow, heading, description, members }) => {
  if (!members?.length) return null

  // Profiles are keyed by name rather than by a field on the block, so giving
  // someone a page under Team is all it takes for their card here to link to it.
  const profiles = await safely(() => getTeamMembers(), [] as TeamMember[])

  // Word order is not part of the match: the grid here says "Ndidiamaka Eya"
  // while her profile says "Eya Ndidiamaka", and both are how she is introduced
  // in different places. Comparing the set of words rather than the string means
  // either can be re-edited without the link silently disappearing.
  const nameKey = (name: string): string =>
    name.trim().toLowerCase().split(/\s+/).filter(Boolean).sort().join(' ')

  const pathForMember = (member: Member): string | null => {
    // An explicit link wins: it is the only way to say "this card and that page
    // are the same person" when the two call them different things.
    const explicit = member.profilePath?.trim()
    if (explicit) return explicit

    const match = profiles.find((profile) => nameKey(profile.name) === nameKey(member.name))
    return match ? `/${match.slug}` : null
  }

  return (
    <section className="container py-12 md:py-16">
      <SectionHeading eyebrow={eyebrow} heading={heading} />
      {description && (
        <p data-reveal="up" className="mt-4 max-w-2xl text-muted-foreground">
          {description}
        </p>
      )}

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3" data-reveal-group="120">
        {members.map((member, i) => {
          // Members with a page of their own get a linked card; the rest stay
          // static, so the grid works whether or not a profile exists.
          const href = pathForMember(member)

          const content = (
            <>
              {member.photo && typeof member.photo === 'object' ? (
                <div className="h-28 w-28 overflow-hidden rounded-full">
                  <Media resource={member.photo} imgClassName="h-full w-full object-cover" />
                </div>
              ) : (
                <span
                  aria-hidden="true"
                  className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-2xl font-semibold text-secondary"
                >
                  {initials(member.name)}
                </span>
              )}

              <h3 className="mt-5 text-lg font-semibold">{member.name}</h3>
              {member.role && <p className="mt-0.5 text-sm text-secondary">{member.role}</p>}
              {member.bio && <p className="mt-3 text-sm text-muted-foreground">{member.bio}</p>}
            </>
          )

          const className = 'block rounded-3xl border border-border bg-card p-8'

          return href ? (
            <Link
              key={i}
              href={href}
              data-reveal="up"
              className={`${className} transition-colors hover:border-secondary/40 hover:bg-background`}
            >
              {content}
              <span className="mt-4 inline-block text-sm font-medium text-secondary">
                View profile
              </span>
            </Link>
          ) : (
            <div key={i} data-reveal="up" className={className}>
              {content}
            </div>
          )
        })}
      </div>
    </section>
  )
}
