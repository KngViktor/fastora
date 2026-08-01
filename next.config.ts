import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 100],
    // No `search` key here on purpose: Payload appends a `?<updatedAt>` cache-busting
    // query string per image, so we can't pin an exact literal value. Omitting `search`
    // skips Next's exact-match check entirely and allows any query string on this path.
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      // Static brand assets (logo/icon/favicon) served straight from /public.
      {
        pathname: '/brand/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
