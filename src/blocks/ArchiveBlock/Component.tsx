import React from 'react'

import { getPosts } from '@/lib/api'
import { CollectionArchive } from '@/components/CollectionArchive'

type Props = {
  id?: string
  eyebrow?: string | null
  heading?: string | null
  relationTo?: 'posts' | 'case-studies' | 'services'
  limit?: number | null
}

export const ArchiveBlock: React.FC<Props> = async (props) => {
  const { id, heading, relationTo = 'posts', limit: limitFromProps } = props

  const limit = limitFromProps || 6

  // Only Posts have a matching archive-card layout today; other relation
  // types fall through without rendering rather than showing a broken grid.
  if (relationTo !== 'posts') return null

  const posts = await getPosts({ limit })

  return (
    <div className="my-16" id={`block-${id}`}>
      {heading && (
        <div className="container mb-10">
          <h2 className="max-w-[48rem] text-3xl font-semibold md:text-5xl">{heading}</h2>
        </div>
      )}
      <CollectionArchive posts={posts} />
    </div>
  )
}
