import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { resendAdapter } from '@payloadcms/email-resend'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, type Plugin } from 'payload'
import { fileURLToPath } from 'url'

import { CaseStudies } from './collections/CaseStudies'
import { Categories } from './collections/Categories'
import { Inquiries } from './collections/Inquiries'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Services } from './collections/Services'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { SiteSettings } from './globals/SiteSettings/config'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import type { CaseStudy, Page, Post, Service } from '@/payload-types'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const generateTitle: GenerateTitle<Page | Post | Service | CaseStudy> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Fastora` : 'Fastora'
}

const generateURL: GenerateURL<Page | Post | Service | CaseStudy> = ({ doc }) => {
  const url = getServerSideURL()
  return doc?.slug ? `${url}/${doc.slug}` : url
}

const storagePlugins: Plugin[] = []

// Supabase Storage is S3-compatible, so we route Payload's S3 storage adapter at
// Supabase's S3 endpoint. See .env.example for the required SUPABASE_S3_* variables.
// Falls back to Payload's local /public/media disk storage when they're unset,
// so local dev works with zero cloud configuration.
if (process.env.SUPABASE_S3_ENDPOINT && process.env.SUPABASE_S3_ACCESS_KEY_ID) {
  storagePlugins.push(
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.SUPABASE_S3_BUCKET || 'media',
      config: {
        endpoint: process.env.SUPABASE_S3_ENDPOINT,
        region: process.env.SUPABASE_S3_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
    }),
  )
}

// Email transport for password resets and notifications. Configured only when
// a Resend API key is present; otherwise Payload falls back to its built-in
// console adapter (which logs the reset link to the server terminal in dev).
const emailAdapter = process.env.RESEND_API_KEY
  ? resendAdapter({
      defaultFromAddress: process.env.RESEND_FROM_ADDRESS || 'onboarding@resend.dev',
      defaultFromName: process.env.RESEND_FROM_NAME || 'Fastora',
      apiKey: process.env.RESEND_API_KEY,
    })
  : undefined

export default buildConfig({
  email: emailAdapter,
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      afterLogin: ['@/components/AfterLogin'],
      header: ['@/components/AdminHeader'],
      Nav: '@/components/AdminNav',
      graphics: {
        Logo: '@/components/Graphics/Logo',
        Icon: '@/components/Graphics/Icon',
      },
      views: {
        dashboard: {
          Component: '@/components/AdminDashboard',
          path: '/',
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    meta: {
      titleSuffix: '- Fastora Admin',
    },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
      // Keep per-instance connection count small: Supabase's pooler caps total
      // clients, and Next.js spins up several parallel workers/serverless
      // functions that each open their own pool.
      max: 5,
    },
    // We manage schema changes via committed migrations (src/migrations) instead of
    // dev-time auto-push, which was re-introspecting the DB on every request.
    push: false,
  }),
  collections: [
    {
      slug: 'folders',
      folders: true,
      admin: { useAsTitle: 'name' },
      fields: [{ name: 'name', type: 'text', required: true, label: 'Folder Name' }],
    },
    Pages,
    Posts,
    Services,
    CaseStudies,
    Testimonials,
    Inquiries,
    Media,
    Categories,
    Users,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, SiteSettings],
  plugins: [
    ...storagePlugins,
    seoPlugin({
      generateTitle,
      generateURL,
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
