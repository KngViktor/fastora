import React from 'react'
import RichText from '@/components/RichText'

type Props = {
  richText?: string | null
}

export const ContentBlock: React.FC<Props> = ({ richText }) => {
  if (!richText) return null

  return (
    <div className="container my-16">
      <RichText data={richText} enableGutter={false} />
    </div>
  )
}
