import configPromise from '@payload-config'
import { getPayload } from 'payload'
import fs from 'fs'
import path from 'path'

/** Uploads the diagonal-cut team photo and sets it as the Home page's hero media, replacing the scroll video. */
const PHOTO_FILENAME = 'hs-pro-333.png'
const PHOTO_ALT = 'Fastora team reviewing brand strategy together'
const OLD_ALT = 'Fastora product preview'

async function run() {
  const payload = await getPayload({ config: configPromise })

  const filePath = path.join(process.cwd(), 'image', PHOTO_FILENAME)
  const data = fs.readFileSync(filePath)

  const existing = await payload.find({
    collection: 'media',
    where: { alt: { equals: PHOTO_ALT } },
    limit: 1,
  })
  for (const doc of existing.docs) {
    await payload.delete({ collection: 'media', id: doc.id })
  }

  const photo = await payload.create({
    collection: 'media',
    data: { alt: PHOTO_ALT },
    file: {
      data,
      mimetype: 'image/png',
      name: PHOTO_FILENAME,
      size: data.length,
    },
  })
  payload.logger.info(`Uploaded hero photo (media id ${photo.id})`)

  const home = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
  })
  if (home.docs[0]) {
    await payload.update({
      collection: 'pages',
      id: home.docs[0].id,
      data: { heroMedia: photo.id },
    })
    payload.logger.info('Set Home page hero photo')
  }

  const old = await payload.find({
    collection: 'media',
    where: { alt: { equals: OLD_ALT } },
    limit: 1,
  })
  for (const doc of old.docs) {
    await payload.delete({ collection: 'media', id: doc.id })
  }
  if (old.docs.length) payload.logger.info('Removed old hero video media doc')
}

await run()
