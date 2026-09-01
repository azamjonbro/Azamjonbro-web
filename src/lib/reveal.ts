/**
 * A health check for IntersectionObserver.
 *
 * Scroll reveals start at `opacity: 0` and are shown when the observer says
 * they have arrived. That is fine until the observer never reports —
 * a suspended or occluded tab, an embedded webview, a headless renderer —
 * at which point every section below the hero is invisible for good.
 *
 * So the reveal is treated as progressive enhancement with a floor: one
 * sentinel observation runs on the first reveal, and if it has not been
 * delivered shortly after, every reveal gives up and simply shows itself.
 * Content is never permanently hidden by an effect that failed to run.
 */

type Listener = () => void

const GRACE_MS = 1200

let state: 'unknown' | 'working' | 'unavailable' = 'unknown'
const waiting = new Set<Listener>()
let probe: ReturnType<typeof setTimeout> | null = null

function giveUp() {
  state = 'unavailable'
  for (const fn of waiting) fn()
  waiting.clear()
}

function startProbe() {
  if (state !== 'unknown' || probe !== null) return

  if (typeof IntersectionObserver === 'undefined') {
    giveUp()
    return
  }

  const io = new IntersectionObserver(() => {
    state = 'working'
    io.disconnect()
    if (probe !== null) clearTimeout(probe)
    waiting.clear()
  })
  io.observe(document.body)

  probe = setTimeout(() => {
    io.disconnect()
    giveUp()
  }, GRACE_MS)
}

/** True when observation is known not to work, so reveals should show now. */
export function observerUnavailable() {
  return state === 'unavailable'
}

/**
 * Registers a reveal to be shown if the observer turns out to be dead.
 * Returns an unsubscribe, and starts the probe on the first caller.
 */
export function onObserverUnavailable(fn: Listener) {
  startProbe()
  if (state === 'unavailable') {
    fn()
    return () => {}
  }
  waiting.add(fn)
  return () => waiting.delete(fn)
}
