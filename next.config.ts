import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

// The Laravel API serves media from whatever host APP_URL points at (its
// local "public" disk resolves to an absolute URL) — allow that host for
// Next's image optimizer without hardcoding it, since it differs between
// local dev (127.0.0.1:8123) and wherever the API is eventually deployed.
const laravelMediaHost = (() => {
  try {
    return new URL(process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000').hostname
  } catch {
    return null
  }
})()

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
      ...(laravelMediaHost
        ? [
            {
              protocol: (laravelMediaHost === 'localhost' || laravelMediaHost === '127.0.0.1'
                ? 'http'
                : 'https') as 'http' | 'https',
              hostname: laravelMediaHost,
            },
          ]
        : []),
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
