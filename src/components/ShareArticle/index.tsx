'use client'

import { Check, Link2, Mail, MoreHorizontal } from 'lucide-react'
import React from 'react'
import type { IconType } from 'react-icons'
import {
  FaFacebookF,
  FaLinkedinIn,
  FaPinterestP,
  FaRedditAlien,
  FaTelegram,
  FaThreads,
  FaTumblr,
  FaWhatsapp,
  FaXTwitter,
} from 'react-icons/fa6'

import { useBrowserSupport } from '@/utilities/useBrowserSupport'

type Props = {
  /** Absolute URL of the post, built on the server so sharing works before hydration. */
  url: string
  title: string
}

/**
 * "Share this article" — every network that accepts a link over a plain URL,
 * plus the device's own share sheet for the ones that do not.
 *
 * Instagram and TikTok have no web share endpoint: neither will open a composer
 * from a link, by design. The "More" button covers them, because the native
 * sheet it opens lists whatever the reader actually has installed — which is
 * also the only honest way to offer "all platforms" from a web page.
 *
 * Every target is a plain link to the network's own endpoint rather than an
 * embedded widget. The official buttons each load a third-party script that
 * tracks the reader whether or not they share anything, which the site asks
 * consent for elsewhere and should not quietly undo here.
 */
export const ShareArticle: React.FC<Props> = ({ url, title }) => {
  const [copied, setCopied] = React.useState(false)
  const canUseSheet = useBrowserSupport(() => typeof navigator.share === 'function')

  // A ref, not state: the timer is bookkeeping, and storing it in state would
  // re-render on every copy for no visible change.
  const resetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current)
    },
    [],
  )

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const targets: { label: string; href: string; Icon: IconType }[] = [
    {
      label: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: FaXTwitter,
    },
    {
      label: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      Icon: FaWhatsapp,
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: FaLinkedinIn,
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: FaFacebookF,
    },
    {
      label: 'Threads',
      href: `https://www.threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}`,
      Icon: FaThreads,
    },
    {
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: FaTelegram,
    },
    {
      label: 'Reddit',
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      Icon: FaRedditAlien,
    },
    {
      label: 'Pinterest',
      href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
      Icon: FaPinterestP,
    },
    {
      label: 'Tumblr',
      href: `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodedUrl}&title=${encodedTitle}`,
      Icon: FaTumblr,
    },
  ]

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      if (resetTimer.current) clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access is refused on an insecure origin and in some in-app
      // browsers. The address bar still holds the link, so there is nothing
      // useful to say — better to do nothing than to flash an error at
      // someone who can simply copy it themselves.
    }
  }

  const openSheet = async () => {
    try {
      await navigator.share({ title, url })
    } catch {
      // Dismissing the sheet rejects. That is not an error worth reporting.
    }
  }

  const tileClass =
    'flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-secondary/40 hover:text-foreground'

  return (
    <div aria-labelledby="share-article-heading" role="group">
      <h2 id="share-article-heading" className="text-lg font-semibold tracking-tight md:text-xl">
        Share this article
      </h2>

      <button
        type="button"
        onClick={copy}
        className="mt-4 flex w-full items-center gap-3 rounded-full border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-secondary/40 hover:text-foreground"
      >
        <span className="flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">
          {copied ? <Check className="h-4 w-4 text-secondary" /> : <Link2 className="h-4 w-4" />}
        </span>
        {/* The label itself changes, so the confirmation reaches a screen
            reader too rather than living only in the swapped icon. */}
        <span aria-live="polite">{copied ? 'Link copied' : 'Copy link'}</span>
      </button>

      <ul className="mt-3 flex flex-wrap gap-2">
        {targets.map(({ label, href, Icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={label}
              aria-label={`Share on ${label}`}
              className={tileClass}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </a>
          </li>
        ))}

        <li>
          <a
            href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
            title="Email"
            aria-label="Share by email"
            className={tileClass}
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
          </a>
        </li>

        {/* Only where the browser actually has a share sheet — on a desktop
            without one this would be a button that silently does nothing. */}
        {canUseSheet && (
          <li>
            <button
              type="button"
              onClick={openSheet}
              title="More"
              aria-label="More sharing options, including Instagram and TikTok"
              className={tileClass}
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        )}
      </ul>
    </div>
  )
}

export default ShareArticle
