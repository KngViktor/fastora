import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * Strips em dashes from all page/post/global content site-wide, replacing
 * " — " with ", " (and bare "—" with ", ") so text reads as a continuous
 * sentence instead of a dash-separated aside. Walks every string value in
 * each document (including nested Lexical richText JSON) rather than
 * targeting specific fields, since the dash shows up in plain text fields
 * (title, excerpt, alt) as well as rich text nodes.
 */
function stripEmDashes(value: string): string {
  return value
    .replace(/\s*—\s*/g, ', ')
    .replace(/,\s*,/g, ',')
    .replace(/,\s*\./g, '.')
    .replace(/\s+,/g, ',')
    .replace(/,\s+$/g, '')
}

function walk<T>(value: T): { changed: boolean; value: T } {
  if (typeof value === 'string') {
    const next = stripEmDashes(value)
    return { changed: next !== value, value: next as unknown as T }
  }
  if (Array.isArray(value)) {
    let changed = false
    const next = value.map((item) => {
      const result = walk(item)
      if (result.changed) changed = true
      return result.value
    })
    return { changed, value: (changed ? next : value) as unknown as T }
  }
  if (value && typeof value === 'object') {
    let changed = false
    const next: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const result = walk(val)
      if (result.changed) changed = true
      next[key] = result.value
    }
    return { changed, value: (changed ? next : value) as unknown as T }
  }
  return { changed: false, value }
}

async function run() {
  const payload = await getPayload({ config: configPromise })

  for (const collection of [
    'pages',
    'posts',
    'case-studies',
    'services',
    'testimonials',
    'media',
  ] as const) {
    const { docs } = await payload.find({ collection, limit: 200, depth: 0 })
    for (const doc of docs) {
      const { changed, value } = walk(doc)
      if (!changed) continue
      const data = value as unknown as Record<string, unknown>
      delete data.id
      delete data.createdAt
      delete data.updatedAt
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await payload.update({ collection, id: doc.id, data: data as any })
      payload.logger.info(`Stripped em dashes from ${collection}/${doc.id} (${(doc as { slug?: string }).slug ?? doc.id})`)
    }
  }

  const siteSettings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const { changed, value } = walk(siteSettings)
  if (changed) {
    const data = value as unknown as Record<string, unknown>
    delete data.id
    delete data.createdAt
    delete data.updatedAt
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.updateGlobal({ slug: 'site-settings', data: data as any })
    payload.logger.info('Stripped em dashes from site-settings global')
  }

  payload.logger.info('Done.')
}

await run()
