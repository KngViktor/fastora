import { cache } from 'react'

import type { Page } from '@/lib/api'
import { getPageBySlug, safely } from '@/lib/api'

/**
 * Fetches a Pages document by slug for routes that render their own
 * logic (Services, Case Studies, Contact) rather than the generic [slug] catch-all
 * — used only to pull the CMS-editable `pageHeader` copy and SEO meta.
 */
export const queryUtilityPage = cache(
  async (slug: string): Promise<Page | null> => safely(() => getPageBySlug(slug), null),
)
