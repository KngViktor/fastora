'use client'

import { Headphones, Pause, Play, RotateCcw } from 'lucide-react'
import React from 'react'

import { chunkForSpeech } from '@/utilities/htmlText'
import { rankVoices } from '@/utilities/speechVoices'
import { useBrowserSupport } from '@/utilities/useBrowserSupport'
import { useSpeechVoices } from '@/utilities/useSpeechVoices'
import { useStoredPreference } from '@/utilities/useStoredPreference'
import { cn } from '@/utilities/ui'

type Props = {
  /** The article flattened to prose on the server — see utilities/htmlText. */
  text: string
}

const SPEEDS = [1, 1.25, 1.5, 0.75] as const

/** Remembers the reader's chosen voice between articles and visits. */
const VOICE_STORAGE_KEY = 'fastora:article-voice'

/**
 * "Listen to this article", read by the device's own voice.
 *
 * Uses the browser's speech synthesiser rather than an audio file, so every
 * post that already exists gets audio without anyone recording anything.
 *
 * The limit of that choice is the voice. A page cannot ship one — it can only
 * choose among those already installed on the reader's device, which is why
 * the accent cannot be guaranteed the way a synthesised audio file could.
 * What it can do is choose well: utilities/speechVoices ranks what is
 * available, putting a Nigerian voice first where one exists and the best
 * recording present where it does not. That matters most on Edge, which
 * offers Microsoft's cloud voices — Nigerian Ezinne and Abeo among them — to
 * any page at no cost. The picker is there because the reader's device knows
 * things this ranking cannot, and some will simply prefer another voice.
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

  const voices = useSpeechVoices()
  const ranked = React.useMemo(() => rankVoices(voices), [voices])

  // '' means "whichever is best here", which is also where a reader whose
  // saved voice is missing on this device lands.
  const [chosenUri, setChosenUri] = useStoredPreference(VOICE_STORAGE_KEY)

  const voice = React.useMemo(() => {
    const chosen = ranked.find((entry) => entry.voice.voiceURI === chosenUri)

    return chosen?.voice ?? ranked[0]?.voice ?? null
  }, [ranked, chosenUri])

  // Where playback is up to. A ref as well as state because the `onend`
  // handler of a queued utterance fires long after the closure that created
  // it, and would otherwise read a stale index.
  const indexRef = React.useRef(0)
  const speedRef = React.useRef(speed)
  /**
   * Which run of the article is current. Incremented every time playback is
   * started or re-queued.
   *
   * A boolean "we are stopping" flag was not enough. `cancel()` fires the
   * cancelled utterance's `onend` asynchronously, after the flag has been put
   * back, so a sentence discarded by a voice or speed change could still
   * resume the run it belonged to — two readings talking over each other. A
   * generation cannot race: a handler from a superseded run always sees that
   * it is no longer the current one, whenever it happens to fire.
   */
  const generationRef = React.useRef(0)

  const speakFrom = React.useCallback(
    // `voiceOverride` exists for the picker: changing voice sets state and
    // re-queues in the same handler, so the voice from this closure is still
    // the previous one at that moment. Passing the new one explicitly avoids
    // reaching for a ref to work around React's own update order.
    (start: number, voiceOverride?: SpeechSynthesisVoice | null) => {
      const synth = window.speechSynthesis
      const activeVoice = voiceOverride === undefined ? voice : voiceOverride

      const generation = ++generationRef.current
      synth.cancel()

      const speakChunk = (index: number) => {
        // Superseded by a later start, a re-queue, or leaving the page.
        if (generation !== generationRef.current) return

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

        // Naming the voice is the whole point: left unset, the engine uses
        // the system default, which is routinely the flattest one installed.
        // The language is taken from the voice rather than the document, so
        // the two cannot contradict each other and leave the engine guessing.
        if (activeVoice) {
          utterance.voice = activeVoice
          utterance.lang = activeVoice.lang
        } else {
          utterance.lang = document.documentElement.lang || 'en'
        }

        utterance.onend = () => speakChunk(index + 1)

        // A synthesiser that errors on one sentence — an unpronounceable
        // string, a voice that failed to load — should not take the rest of
        // the article down with it.
        utterance.onerror = () => speakChunk(index + 1)

        synth.speak(utterance)
      }

      speakChunk(start)
      setStatus('playing')
    },
    [chunks, voice],
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

  const changeVoice = (voiceUri: string) => {
    setChosenUri(voiceUri)

    // The voice is bound when an utterance is created, so like the rate it
    // only reaches the reader by re-queueing from the sentence being spoken.
    // voiceRef is assigned during render, so the re-queue is deferred to let
    // this state change land first.
    if (status !== 'idle') {
      const next =
        ranked.find((entry) => entry.voice.voiceURI === voiceUri)?.voice ?? ranked[0]?.voice ?? null

      speakFrom(indexRef.current, next)
    }
  }

  // Leaving the article must stop the voice. Client-side navigation unmounts
  // this without unloading the page, so nothing else would.
  React.useEffect(
    () => () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        // Retires the current run, so a late `onend` cannot start the next
        // sentence after the component has gone.
        generationRef.current++
        window.speechSynthesis.cancel()
      }
    },
    [],
  )

  // A device that lists voices but none in English will read this article
  // through whatever it does have, which is worse than offering nothing.
  //
  // The two conditions are separate on purpose: an *empty* list is not the
  // same signal. Several browsers return nothing from getVoices() and still
  // speak perfectly well with their default, so emptiness must not hide the
  // player — only a list that was given and holds no English voice.
  const hasNoEnglishVoice = voices.length > 0 && ranked.length === 0

  if (!supported || !chunks.length || hasNoEnglishVoice) return null

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

      {/* The voice belongs to the reader's device, so it is worth saying so
          rather than leaving them wondering why it sounds as it does — and
          worth offering the choice, since their device may hold a better one
          than any ranking can infer. */}
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        {ranked.length > 1 ? (
          <>
            <label htmlFor="article-voice">Voice</label>
            <select
              id="article-voice"
              value={voice?.voiceURI ?? ''}
              onChange={(event) => changeVoice(event.target.value)}
              className="max-w-full truncate rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
            >
              {ranked.map(({ voice: option, label }) => (
                <option key={option.voiceURI} value={option.voiceURI}>
                  {label}
                </option>
              ))}
            </select>
            <span>&mdash; from your device</span>
          </>
        ) : (
          <span>Read aloud by your device&apos;s built-in voice.</span>
        )}
      </div>
    </div>
  )
}

export default ArticleAudio
