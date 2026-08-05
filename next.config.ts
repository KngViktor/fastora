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

  /**
   * The ten services became four, with the old names now listed as what each
   * parent covers rather than pages of their own. These nine URLs were live and
   * indexed, so they redirect to the service that absorbed them instead of
   * 404ing.
   *
   * Permanent, because the move is permanent: a 301 passes on the search ranking
   * the old URL had earned, where a 302 would strand it.
   */
  async redirects() {
    const reparented: Record<string, string> = {
      'strategic-communications': 'communications-strategy',
      'communication-advisory': 'communications-strategy',
      'reputation-management': 'communications-strategy',
      'brand-consulting': 'brand-positioning',
      'founder-branding': 'brand-positioning',
      'content-strategy': 'content-and-storytelling',
      copywriting: 'content-and-storytelling',
      'social-media-management': 'digital-marketing',
      'marketing-strategy': 'digital-marketing',
    }

    return Object.entries(reparented).map(([from, to]) => ({
      source: `/services/${from}`,
      destination: `/services/${to}`,
      permanent: true,
    }))
  },
}

export default nextConfig
