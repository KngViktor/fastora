import type { Media, Page } from '@/lib/api'

/** Shared shape passed to hero variant components, assembled from a Page's `hero` object by RenderHero. */
export type HeroData = {
  links?: Page['hero']['links']
  media?: Media | null
  richText?: string | null
  type?: string
}
