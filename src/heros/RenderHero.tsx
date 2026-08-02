import React from 'react'

import type { HeroData } from '@/heros/types'

import { HighImpactHero } from '@/heros/HighImpact'
import { LowImpactHero } from '@/heros/LowImpact'
import { MediumImpactHero } from '@/heros/MediumImpact'

const heroes = {
  highImpact: HighImpactHero,
  lowImpact: LowImpactHero,
  mediumImpact: MediumImpactHero,
}

export const RenderHero: React.FC<HeroData> = ({ type, richText, links, media }) => {
  if (!type || type === 'none' || !(type in heroes)) return null

  const HeroToRender = heroes[type as keyof typeof heroes]

  return <HeroToRender links={links} media={media} richText={richText} type={type} />
}
