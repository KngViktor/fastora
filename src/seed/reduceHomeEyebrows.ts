import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * Clears the `eyebrow` field on Home page layout blocks that shouldn't carry
 * one per the redesign's "max 1 eyebrow per 3 sections" budget. Targeted
 * update to the live Home doc rather than re-running the full seed, which
 * deletes and recreates services/case-studies/testimonials/posts wholesale
 * and would blow away unrelated content (hero media, manual edits, etc.).
 */
const CLEAR_EYEBROW_ON = new Set([
  'whyFastora',
  'ourProcess',
  'selectedWork',
  'testimonialsBlock',
  'latestInsights',
])

async function run() {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
  })
  const home = docs[0]
  if (!home) {
    payload.logger.error('Home page not found')
    return
  }

  const layout = (home.layout as unknown as Array<Record<string, unknown>>) || []
  let changed = 0
  const nextLayout = layout.map((block) => {
    const blockType = block.blockType as string
    if (CLEAR_EYEBROW_ON.has(blockType) && block.eyebrow) {
      changed++
      const { eyebrow: _eyebrow, ...rest } = block
      return rest
    }
    return block
  })

  if (!changed) {
    payload.logger.info('No eyebrows to clear, nothing to do')
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await payload.update({ collection: 'pages', id: home.id, data: { layout: nextLayout as any } })
  payload.logger.info(`Cleared eyebrow on ${changed} Home blocks`)
}

await run()
