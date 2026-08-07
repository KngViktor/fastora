import React from 'react'

import type { Media as MediaType } from '@/lib/api'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

type Props = {
  richText?: string | null
  image?: MediaType | null
  imagePosition?: 'left' | 'right' | null
}

/**
 * Plain text by default, matching every existing use of this block. With an
 * image attached it becomes a two-column split instead — the same layout
 * family as the "About Fastora" block, so a page mixing several of these
 * with `imagePosition` alternated reads as a proper editorial page rather
 * than a stack of paragraphs with nothing to anchor the eye.
 *
 * On mobile the image always leads (`order-first`), whichever side it sits
 * on at desktop width — flipping which side leads only on the wider
 * breakpoint keeps the "image on the right" case from reading as backwards
 * once the columns stack.
 */
export const ContentBlock: React.FC<Props> = ({ richText, image, imagePosition }) => {
  if (!richText) return null

  if (image && typeof image === 'object') {
    const imageOnLeft = imagePosition === 'left'

    return (
      <div className="container my-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div
            data-reveal="scale"
            className={imageOnLeft ? 'order-first' : 'order-first lg:order-last'}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-border bg-muted">
              <Media resource={image} fill imgClassName="object-cover object-top" />
            </div>
          </div>
          <div
            data-reveal="up"
            className="[&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:md:text-4xl [&_p]:mt-4 [&_p]:text-muted-foreground"
          >
            <RichText data={richText} enableGutter={false} enableProse={false} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container my-16">
      <RichText data={richText} enableGutter={false} />
    </div>
  )
}
