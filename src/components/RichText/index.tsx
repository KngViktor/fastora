import React from 'react'

import { cn } from '@/utilities/ui'

type Props = {
  data: string | null | undefined
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

/**
 * Renders rich text authored in Filament's RichEditor, which stores plain
 * HTML rather than Payload's Lexical JSON. Content is only ever written by
 * trusted admin/editor-tier users through the CMS, so rendering it directly
 * is safe — there is no user-supplied HTML path here.
 */
export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, data, ...rest } = props

  if (!data) return null

  return (
    <div
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md': enableProse,
        },
        className,
      )}
      dangerouslySetInnerHTML={{ __html: data }}
      {...rest}
    />
  )
}
