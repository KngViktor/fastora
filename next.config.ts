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
    localPatterns: [
      // Kept for any media the API returns as a relative path rather than an
      // absolute URL, which happens when the backend's APP_URL is unset in
      // local development. getMediaUrl() passes those through untouched so
      // Next treats them as local and skips remotePatterns, which since
      // Next.js 16 refuses private IPs. No `search` key, so any cache-busting
      // query string on this path is allowed rather than matched literally.
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

export default nextConfig
