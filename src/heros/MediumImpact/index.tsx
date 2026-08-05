import React from 'react'

import type { HeroData } from '@/heros/types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const MediumImpactHero: React.FC<HeroData> = ({ links, media, richText }) => {
  return (
    <div className="">
      <div className="container mb-8">
        {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}

        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex flex-wrap gap-4">
            {links.map((link, i) => {
              return (
                <li key={i}>
                  <CMSLink
                    label={link.label}
                    url={link.url}
                    appearance={link.appearance as 'default' | 'outline' | undefined}
                  />
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <div className="container ">
        {media && typeof media === 'object' && (
          <div>
            <Media
              className="-mx-4 md:-mx-8 2xl:-mx-16"
              imgClassName=""
              priority
              resource={media}
            />
          </div>
        )}
      </div>
    </div>
  )
}
