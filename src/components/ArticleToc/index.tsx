'use client'

import React from 'react'

import { MIN_TOC_HEADINGS, type ArticleHeading } from '@/utilities/articleToc'
import { cn } from '@/utilities/ui'

type Props = {
  headings: ArticleHeading[]
}

/** Matches `scroll-margin-top` on `.cms-richtext` headings, so the two never disagree. */
const SCROLL_OFFSET = 112

/**
 * The "Contents" list beside a post, with the section being read marked.
 *
 * The mark is worked out from scroll position rather than an
 * IntersectionObserver: on a long article several headings are on screen at
 * once, and an observer can only say which ones are visible, not which one the
 * reader is under. Taking the last heading above the fold line answers that
 * directly, and it still holds at the bottom of the page, where the final
 * section is often too short to ever fill the viewport.
 */
export const ArticleToc: React.FC<Props> = ({ headings }) => {
  const [activeId, setActiveId] = React.useState<string>('')

  React.useEffect(() => {
    if (!headings.length) return

    let frame = 0

    const sync = () => {
      frame = 0

      const positions = headings
        .map(({ id }) => {
          const element = document.getElementById(id)
          return element ? { id, top: element.getBoundingClientRect().top } : null
        })
        .filter((entry): entry is { id: string; top: number } => entry !== null)

      if (!positions.length) return

      // Within a hair of the bottom, the last section is current whether or not
      // its heading ever cleared the fold line — there is no more scrolling
      // left to make it do so.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2

      if (atBottom) {
        setActiveId(positions[positions.length - 1]!.id)
        return
      }

      const passed = positions.filter(({ top }) => top <= SCROLL_OFFSET + 8)

      // Above the first heading, the first entry leads rather than none of
      // them, so the list never reads as though the article has not started.
      setActiveId(passed.length ? passed[passed.length - 1]!.id : positions[0]!.id)
    }

    const onScroll = () => {
      // Coalesce to one measurement per frame: scroll fires far more often
      // than the page can paint, and each run reads layout for every heading.
      if (!frame) frame = window.requestAnimationFrame(sync)
    }

    sync()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [headings])

  if (headings.length < MIN_TOC_HEADINGS) return null

  return (
    <nav aria-labelledby="article-contents-heading">
      <h2
        id="article-contents-heading"
        className="text-lg font-semibold tracking-tight md:text-xl"
      >
        Contents
      </h2>

      <ul className="mt-5 space-y-1 border-t border-border pt-5">
        {headings.map(({ id, text, level }) => {
          const isActive = id === activeId

          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'block border-l-2 py-2 text-sm leading-snug transition-colors',
                  level === 3 ? 'pl-7' : 'pl-4',
                  isActive
                    ? 'border-secondary font-medium text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default ArticleToc
