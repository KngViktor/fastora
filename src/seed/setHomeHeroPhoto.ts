import configPromise from '@payload-config'
import { getPayload } from 'payload'
import fs from 'fs'
import path from 'path'

/** Uploads the pre-composited hero background+photo image and sets it as the Home page's hero media. */
const IMAGE_FILENAME = 'fastora-hero-section.png'
const IMAGE_ALT = 'Fastora team reviewing brand strategy together'
const OLD_ALTS = ['Fastora product preview', 'Fastora team reviewing brand strategy together']

async function run() {
  const payload = await getPayload({ config: configPromise })

  const filePath = path.join(process.cwd(), 'image', IMAGE_FILENAME)
  const data = fs.readFileSync(filePath)

  const existing = await payload.find({
    collection: 'media',
    where: { alt: { equals: IMAGE_ALT } },
    limit: 10,
  })
  for (const doc of existing.docs) {
    await payload.delete({ collection: 'media', id: doc.id })
  }

  const image = await payload.create({
    collection: 'media',
    data: { alt: IMAGE_ALT },
    file: {
      data,
      mimetype: 'image/png',
      name: IMAGE_FILENAME,
      size: data.length,
    },
  })
  payload.logger.info(`Uploaded hero composite image (media id ${image.id})`)

  const home = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
  })
  if (home.docs[0]) {
    await payload.update({
      collection: 'pages',
      id: home.docs[0].id,
      data: { heroMedia: image.id },
    })
    payload.logger.info('Set Home page hero image')
  }

  for (const alt of OLD_ALTS) {
    if (alt === IMAGE_ALT) continue
    const old = await payload.find({
      collection: 'media',
      where: { alt: { equals: alt } },
      limit: 10,
    })
    for (const doc of old.docs) {
      await payload.delete({ collection: 'media', id: doc.id })
    }
    if (old.docs.length) payload.logger.info(`Removed old media doc (alt: ${alt})`)
  }
}

await run()
