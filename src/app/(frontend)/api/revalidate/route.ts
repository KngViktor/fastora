import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Revalidation webhook called by the Laravel backend whenever content
 * changes (see fastora-backend's app/Observers). Laravel can't call
 * Next.js's revalidatePath/revalidateTag directly since it's a separate
 * app, so it POSTs here instead, authenticated with a shared secret
 * (FASTORA_API_TOKEN — must match the same value in Laravel's .env).
 *
 * Body: { "paths"?: string[], "tags"?: string[] }
 */
export async function POST(req: NextRequest): Promise<Response> {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!process.env.FASTORA_API_TOKEN || token !== process.env.FASTORA_API_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { paths?: unknown; tags?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const paths = Array.isArray(body.paths) ? body.paths.filter((p): p is string => typeof p === 'string') : []
  const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === 'string') : []

  if (paths.length === 0 && tags.length === 0) {
    return NextResponse.json({ error: 'Provide at least one of "paths" or "tags"' }, { status: 400 })
  }

  for (const path of paths) {
    if (!path.startsWith('/')) continue
    // "layout" invalidates the path and everything nested under it (used for
    // site-wide changes like Site Settings or nav, where "/" should refresh
    // every page, not just the homepage).
    revalidatePath(path, path === '/' ? 'layout' : 'page')
  }

  for (const tag of tags) {
    revalidateTag(tag, 'max')
  }

  return NextResponse.json({ revalidated: true, paths, tags })
}
