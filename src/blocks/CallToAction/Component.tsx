import React from 'react'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

type Props = {
  richText?: string | null
  links?: { label: string; url: string; appearance?: string }[]
}

export const CallToActionBlock: React.FC<Props> = ({ links, richText }) => {
  return (
    <div className="container py-16 md:py-24">
      <div
        data-reveal="scale"
        className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-10 md:p-16"
      >
        {/* accent glow */}
        <div
          className="animate-float pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              'radial-gradient(circle at center, rgba(43,127,214,0.35), transparent 62%)',
          }}
        />
        <div className="relative z-10 flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl [&_h2]:text-4xl [&_h2]:font-semibold md:[&_h2]:text-6xl [&_p]:mt-4 [&_p]:text-muted-foreground">
            {richText && <RichText className="mb-0" data={richText} enableGutter={false} />}
          </div>
          <div className="flex shrink-0 flex-col gap-4 sm:flex-row md:flex-col">
            {(links || []).map((link, i) => {
              return (
                <CMSLink
                  key={i}
                  size="lg"
                  label={link.label}
                  url={link.url}
                  appearance={link.appearance as 'default' | 'outline' | undefined}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
