import React from 'react'

import RichText from '@/components/RichText'

type Props = {
  visionHeading?: string | null
  visionBody?: string | null
  missionHeading?: string | null
  missionBody?: string | null
}

export const VisionMissionBlock: React.FC<Props> = ({
  visionHeading,
  visionBody,
  missionHeading,
  missionBody,
}) => {
  if (!visionBody && !missionBody) return null

  return (
    <section className="container py-8 md:py-12">
      <div
        data-reveal="up"
        className="grid gap-10 rounded-3xl bg-muted p-8 sm:grid-cols-2 sm:gap-16 md:p-12"
      >
        {visionBody && (
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              {visionHeading || 'Our vision'}
            </h2>
            <div className="mt-4 [&_p]:mt-4 [&_p]:text-muted-foreground [&_p:first-child]:mt-0">
              <RichText data={visionBody} enableGutter={false} enableProse={false} />
            </div>
          </div>
        )}

        {missionBody && (
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              {missionHeading || 'Our mission'}
            </h2>
            <div className="mt-4 [&_p]:mt-4 [&_p]:text-muted-foreground [&_p:first-child]:mt-0">
              <RichText data={missionBody} enableGutter={false} enableProse={false} />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
