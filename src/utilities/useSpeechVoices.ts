'use client'

import { useSyncExternalStore } from 'react'

/** Shared empty result, so the server snapshot is referentially stable. */
const NONE: SpeechSynthesisVoice[] = []

// getVoices() hands back a fresh array every call. useSyncExternalStore
// compares snapshots by identity and re-renders when they differ, so
// returning that array directly would loop forever. The list is cached and
// only replaced when the voices themselves actually change.
let cached: SpeechSynthesisVoice[] = NONE
let cachedKey = ''

function getSnapshot(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return NONE

  const voices = window.speechSynthesis.getVoices()
  const key = voices.map((voice) => voice.voiceURI).join('|')

  if (key !== cachedKey) {
    cachedKey = key
    cached = voices
  }

  return cached
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return () => {}

  window.speechSynthesis.addEventListener('voiceschanged', onChange)

  return () => window.speechSynthesis.removeEventListener('voiceschanged', onChange)
}

/**
 * The voices this browser can speak with.
 *
 * Chrome loads them asynchronously and returns an empty list from the first
 * `getVoices()` call, firing `voiceschanged` once they are ready — which is
 * why this is a subscription rather than a one-off read. A player that asked
 * once, at mount, would be left with the default voice forever on exactly the
 * browser most readers use.
 */
export function useSpeechVoices(): SpeechSynthesisVoice[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => NONE)
}
