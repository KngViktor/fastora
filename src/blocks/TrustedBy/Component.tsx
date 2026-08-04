import React from 'react'

import type { Media as MediaType } from '@/lib/api'
import { Media } from '@/components/Media'

type Client = {
  media?: MediaType | null
  name: string
  industry?: string | null
}

type Props = {
  heading?: string | null
  logos?: Client[]
}

/**
 * Client wall, sitting directly under the hero.
 *
 * Each client renders as its logo where one has been uploaded and as its name
 * where one has not, so a confirmed client list can go live before the logo
 * files have been collected and then upgrade to logos one at a time with no
 * further code change.
 *
 * The industry shows only in the text form. Beneath a recognisable logo it
 * would restate what the mark already says, but "Biografrica" alone tells a
 * reader nothing, whereas "Biografrica / Media" shows the range of sectors the
 * work spans.
 *
 * Still renders nothing when the list is empty, so the home page never shows a
 * bare strip implying clients that do not exist.
 */
export const TrustedByBlock: React.FC<Props> = ({ heading, logos }) => {
  const clients = (logos ?? []).filter((client) => client.name || client.media)

  if (clients.length === 0) return null

  return (
    <section className="border-y border-border bg-muted/40">
      <div className="container flex flex-col gap-8 py-10 md:flex-row md:items-center md:gap-14 md:py-12">
        {heading && <p className="shrink-0 text-sm font-medium text-muted-foreground">{heading}</p>}

        <ul className="flex flex-wrap items-center gap-x-10 gap-y-6 md:gap-x-14">
          {clients.map((client, i) => (
            <li key={i}>
              {client.media ? (
                <Media
                  resource={client.media}
                  alt={client.name}
                  htmlElement={null}
                  imgClassName="h-7 w-auto object-contain opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0 md:h-8"
                />
              ) : (
                <div>
                  <p className="text-base font-semibold tracking-tight text-foreground/80">
                    {client.name}
                  </p>
                  {client.industry && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{client.industry}</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
