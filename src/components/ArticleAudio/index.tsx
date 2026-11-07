'use client'

import { Headphones, Pause, Play, RotateCcw } from 'lucide-react'
import React from 'react'

import { chunkForSpeech } from '@/utilities/htmlText'
import { useBrowserSupport } from '@/utilities/useBrowserSupport'
import { cn } from '@/utilities/ui'

type Props = {
  /** The article flattened to prose on the server — see utilities/htmlText. */
  text: string
}

const SPEEDS = [1, 1.25, 1.5, 0.75] as const

/**
 * "Listen to this article", read by the device's own voice.
 *
 * Uses the browser's speech synthesiser rather than an audio file, so every
 * post that already exists gets audio without anyone recording anything. The
 * cost of that choice is the voice: it is whatever the reader's OS ships, and
 * it differs between a Pixel, an iPhone and a Windows laptop.
 *
 * The text is flattened on the server and passed in, rather than scraped from
 * the DOM here, so the reading matches the article as authored instead of
 * whatever the stylesheet happens to have made visible.
 */
export const ArticleAudio: React.FC<Props> = ({ text }) => {
  const supported = useBrowserSupport(() => 'speechSynthesis' in window)
  const [status, setStatus] = React.useState<'idle' | 'playing' | 'paused'>('idle')
  const [spoken, setSpoken] = React.useState(0)
  const [speed, setSpeed] = React.useState<number>(1)

  const chunks = React.useMemo(() => chunkForSpeech(text), [text])

  // Where playback is up to. A ref as well as state because the `onend`
  // handler of a queued utterance fires long after the closure that created
  // it, and would otherwise read a stale index.
  const indexRef = React.useRef(0)
  const speedRef = React.useRef(speed)
  // Set while we are tearing playback down on purpose. `cancel()` fires the
  // same `onend` as a sentence finishing normally, and without this flag
  // stopping would immediately queue the next chunk instead.
  const stoppingRef = React.useRef(false)

  const speakFrom = React.useCallback(
    (start: number) => {
      const synth = window.speechSynthesis

      stoppingRef.current = true
      synth.cancel()
      stoppingRef.current = false

      const speakChunk = (index: number) => {
        if (index >= chunks.length) {
          setStatus('idle')
          setSpoken(chunks.length)
          indexRef.current = 0
          return
        }

        indexRef.current = index
        setSpoken(index)

        const utterance = new SpeechSynthesisUtterance(chunks[index])
        utterance.rate = speedRef.current
        utterance.lang = document.documentElement.lang || 'en'

        utterance.onend = () => {
          if (stoppingRef.current) return
          speakChunk(index + 1)
        }

        // A synthesiser that errors on one sentence — an unpronounceable
        // string, a voice that failed to load — should not take the rest of
        // the article down with it.
        utterance.onerror = () => {
          if (stoppingRef.current) return
          speakChunk(index + 1)
        }

        synth.speak(utterance)
      }

      speakChunk(start)
      setStatus('playing')
    },
    [chunks],
  )

  const toggle = () => {
    const synth = window.speechSynthesis

    if (status === 'playing') {
      synth.pause()
      setStatus('paused')
      return
    }

    if (status === 'paused') {
      synth.resume()
      setStatus('playing')
      return
    }

    speakFrom(0)
  }

  const restart = () => {
    setSpoken(0)
    speakFrom(0)
  }

  const cycleSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(speed as (typeof SPEEDS)[number]) + 1) % SPEEDS.length]!
    setSpeed(next)
    speedRef.current = next

    // Rate is fixed when an utterance is created, so a change only reaches the
    // reader by re-queueing from the sentence being spoken.
    if (status !== 'idle') speakFrom(indexRef.current)
  }

  // Leaving the article must stop the voice. Client-side navigation unmounts
  // this without unloading the page, so nothing else would.
  React.useEffect(
    () => () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        stoppingRef.current = true
        window.speechSynthesis.cancel()
      }
    },
    [],
  )

  if (!supported || !chunks.length) return null

  const progress = status === 'idle' && spoken === 0 ? 0 : (spoken / chunks.length) * 100
  const isPlaying = status === 'playing'

  return (
    <div className="mb-10 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? 'Pause the article' : 'Listen to this article'}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Headphones className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
            Listen to this article
          </p>

          <div
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label="Listening progress"
          >
            <div
              className="h-full rounded-full bg-secondary transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={cycleSpeed}
            aria-label={`Playback speed: ${speed} times. Tap to change.`}
            className="rounded-full px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            {speed}&times;
          </button>

          <button
            type="button"
            onClick={restart}
            disabled={status === 'idle' && spoken === 0}
            aria-label="Start again from the beginning"
            className={cn(
              'rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground',
              status === 'idle' && spoken === 0 && 'pointer-events-none opacity-40',
            )}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* The voice is the reader's own, so it is worth saying so once rather
          than leaving them to wonder why it sounds nothing like a narrator. */}
      <p className="mt-3 text-xs text-muted-foreground">
        Read aloud by your device&apos;s built-in voice.
      </p>
    </div>
  )
}

export default ArticleAudio
