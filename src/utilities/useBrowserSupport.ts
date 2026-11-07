'use client'

import { useSyncExternalStore } from 'react'

/** No store to subscribe to: the answer cannot change for the life of the page. */
const noopSubscribe = () => () => {}

/**
 * Answers "can this browser do X?" without breaking hydration.
 *
 * Feature detection has to happen on the client, but reading `navigator` while
 * rendering would make the server and the first client render disagree. Doing
 * it in an effect and calling setState is the obvious alternative and the one
 * React now warns about, since it renders twice on every mount.
 *
 * `useSyncExternalStore` is the supported way to say "this value is false on
 * the server and whatever the browser says once we are there": React renders
 * the server answer during hydration, then swaps in the client's.
 *
 * `check` must return a primitive, and the same one each time it is asked —
 * a fresh object would re-render forever.
 */
export function useBrowserSupport(check: () => boolean): boolean {
  return useSyncExternalStore(noopSubscribe, check, () => false)
}
