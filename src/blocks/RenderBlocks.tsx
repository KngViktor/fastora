import React, { Fragment } from 'react'

import type { LayoutBlock } from '@/lib/api'

import { AboutFastoraBlock } from '@/blocks/AboutFastora/Component'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { TrustedByBlock } from '@/blocks/TrustedBy/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { ServicesOverviewBlock } from '@/blocks/ServicesOverview/Component'
import { WhyFastoraBlock } from '@/blocks/WhyFastora/Component'
import { OurProcessBlock } from '@/blocks/OurProcess/Component'
import { AudienceGridBlock } from '@/blocks/AudienceGrid/Component'
import { SelectedWorkBlock } from '@/blocks/SelectedWork/Component'
import { TestimonialsBlockComponent } from '@/blocks/TestimonialsBlock/Component'
import { FAQBlockComponent } from '@/blocks/FAQ/Component'
import { LatestInsightsBlockComponent } from '@/blocks/LatestInsights/Component'
import { ConsultationFormBlock } from '@/blocks/ConsultationForm/Component'
import { VisionMissionBlock } from '@/blocks/VisionMission/Component'

const blockComponents = {
  aboutFastora: AboutFastoraBlock,
  trustedBy: TrustedByBlock,
  archive: ArchiveBlock,
  content: ContentBlock,
  visionMission: VisionMissionBlock,
  cta: CallToActionBlock,
  mediaBlock: MediaBlock,
  servicesOverview: ServicesOverviewBlock,
  whyFastora: WhyFastoraBlock,
  ourProcess: OurProcessBlock,
  audienceGrid: AudienceGridBlock,
  selectedWork: SelectedWorkBlock,
  testimonialsBlock: TestimonialsBlockComponent,
  faq: FAQBlockComponent,
  latestInsights: LatestInsightsBlockComponent,
  consultationForm: ConsultationFormBlock,
}

export const RenderBlocks: React.FC<{
  blocks: LayoutBlock[]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { type, data } = block

          if (type && type in blockComponents) {
            const Block = blockComponents[type as keyof typeof blockComponents]

            if (Block) {
              return <Block {...data} disableInnerContainer key={index} />
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
