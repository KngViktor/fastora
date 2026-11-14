'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * A single per-viewer setting, remembered in localStorage.
 *
 * Written as an external store rather than state seeded from localStorage
 * because the server renders no value and the browser may have one: reading
 * it while rendering makes the two disagree and React reports a hydration
 * mismatch. useSyncExternalStore is the supported way to say "empty on the
 * server, whatever is stored once we are in the browser".
 *
 * Subscribing to `storage` as well means two tabs open on the site stay in
 * step, which costs a line and saves a reader wondering why their choice did
 * not follow them.
 *
 * Every access is guarded: localStorage throws rather than returning null in
 * a private window with site data blocked, and a setting is never worth
 * taking the page down for.
 */
export function useStoredPreference(
  key: string,
  fallback = '',
): [string, (value: string) => void] {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined') return () => {}

      const onStorage = (event: StorageEvent) => {
        if (event.key === null || event.key === key) onChange()
      }

      window.addEventListener('storage', onStorage)
      window.addEventListener(LOCAL_CHANGE_EVENT, onChange)

      return () => {
        window.removeEventListener('storage', onStorage)
        window.removeEventListener(LOCAL_CHANGE_EVENT, onChange)
      }
    },
    [key],
  )

  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(key) ?? fallback
    } catch {
      return fallback
    }
  }, [key, fallback])

  const value = useSyncExternalStore(subscribe, getSnapshot, () => fallback)

  const set = useCallback(
    (next: string) => {
      try {
        window.localStorage.setItem(key, next)
      } catch {
        // Nothing to do: the choice still applies for this page view, it
        // just will not be remembered for the next one.
      }

      // `storage` only fires in *other* tabs, so this tab has to tell itself.
      window.dispatchEvent(new Event(LOCAL_CHANGE_EVENT))
    },
    [key],
  )

  return [value, set]
}

const LOCAL_CHANGE_EVENT = 'fastora:preference-changed'
