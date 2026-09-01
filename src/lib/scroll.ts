import Lenis from 'lenis'

/**
 * Scroll state that changes at frame rate.
 *
 * Kept outside React for the same reason `pointer` is: the camera reads it
 * every frame, and a re-render per scrolled pixel would cost more than the
 * whole 3D scene. React only ever hears about the active section, which
 * changes a handful of times per visit.
 */
export const scroll = {
  /** Pixels from the top of the document. */
  y: 0,
  /**
   * Position along the section list as a float: the integer part is the
   * section, the fraction is the eased transition into the next one.
   * This is what drives the camera.
   */
  stage: 0,
  /** The section the visitor is currently reading. */
  section: 0,
}

/* ─── SECTION REGISTRY ────────────────────────────────────────── */

interface Tracked {
  id: string
  el: HTMLElement
  top: number
}

/** Document order is authoritative, so entries are re-sorted on measure. */
let tracked: Tracked[] = []

export function registerSection(id: string, el: HTMLElement) {
  tracked.push({ id, el, top: 0 })
  measureSections()
  return () => {
    tracked = tracked.filter((t) => t.el !== el)
  }
}

export function measureSections() {
  for (const t of tracked) {
    t.top = t.el.getBoundingClientRect().top + window.scrollY
  }
  tracked.sort((a, b) => a.top - b.top)
}

/** Smoothstep, so the camera settles inside a section instead of sliding through it. */
const ease = (t: number) => t * t * (3 - 2 * t)

/**
 * Where the camera should be, given a scroll position.
 *
 * The move is timed against the viewport rather than against the section:
 * a shot is held until the next section is within roughly a screen of the
 * top, then eases across so it arrives exactly as that section does. Timing
 * it against the section instead would make the camera drift for the entire
 * length of a long section and snap through a short one.
 */
function computeStage(y: number) {
  const last = tracked.length - 1
  if (last < 1) return 0
  if (y >= tracked[last].top) return last

  for (let i = 0; i < last; i++) {
    const nextTop = tracked[i + 1].top
    if (y >= nextTop) continue

    const span = nextTop - tracked[i].top
    const travel = Math.min(span, window.innerHeight * 0.85)
    const f = (y - (nextTop - travel)) / travel
    return f <= 0 ? i : i + ease(Math.min(1, f))
  }

  return last
}

/* ─── ACTIVE SECTION SUBSCRIPTION ─────────────────────────────── */

type Listener = (index: number) => void
const listeners = new Set<Listener>()

export function onSectionChange(fn: Listener) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/**
 * For discrete UI that follows the scroll position — the condensed
 * navigation, and anything else whose state a visitor would notice going
 * stale. Continuous, per-frame motion should read `scroll` from a frame
 * loop instead of subscribing here.
 */
type PositionListener = (y: number) => void
const positionListeners = new Set<PositionListener>()

export function onScrollPosition(fn: PositionListener) {
  positionListeners.add(fn)
  fn(scroll.y)
  return () => {
    positionListeners.delete(fn)
  }
}

/* ─── THE LOOP ────────────────────────────────────────────────── */

let lenis: Lenis | null = null
let raf = 0
let refs = 0

/**
 * Starts smooth scrolling and the frame loop that keeps `scroll` current.
 * Reference counted so React 19's double-invoked effects cannot leave two
 * Lenis instances fighting over the wheel.
 */
export function startScroll(reducedMotion: boolean) {
  refs++
  if (refs > 1) return

  if (!reducedMotion) {
    lenis = new Lenis({
      duration: 1.05,
      /* Slightly over-damped: expensive rather than bouncy. */
      easing: (t) => 1 - Math.pow(1 - t, 3.2),
      wheelMultiplier: 0.9,
      /* Native inertia on touch is better than anything simulated. */
      syncTouch: false,
    })
  }

  /**
   * Recomputes everything derived from the scroll position.
   *
   * Called from the frame loop, which is what the camera needs, and also
   * from the native scroll event, which fires even when requestAnimationFrame
   * is being throttled — a backgrounded tab, a low-power device, a browser
   * that has stopped painting. Without the second path the navigation's
   * active section would silently freeze while the page kept scrolling.
   */
  const sample = () => {
    const y = window.scrollY
    scroll.y = y
    scroll.stage = computeStage(y)

    const next = Math.round(scroll.stage)
    if (next !== scroll.section) {
      scroll.section = next
      for (const fn of listeners) fn(next)
    }

    for (const fn of positionListeners) fn(y)
  }

  const tick = (time: number) => {
    lenis?.raf(time)
    sample()
    raf = requestAnimationFrame(tick)
  }

  raf = requestAnimationFrame(tick)
  window.addEventListener('scroll', sample, { passive: true })
  sample()

  const onResize = () => {
    measureSections()
    sample()
  }
  window.addEventListener('resize', onResize)
  /* Late-loading images and fonts move every section below them. */
  const settle = setTimeout(() => {
    measureSections()
    sample()
  }, 600)

  cleanup = () => {
    cancelAnimationFrame(raf)
    clearTimeout(settle)
    window.removeEventListener('scroll', sample)
    window.removeEventListener('resize', onResize)
    lenis?.destroy()
    lenis = null
  }
}

let cleanup: (() => void) | null = null

export function stopScroll() {
  refs = Math.max(0, refs - 1)
  if (refs > 0) return
  cleanup?.()
  cleanup = null
}

/** Used by the navigation and every in-page anchor. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.2 })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Locks the page behind a modal without losing the scroll position. */
export function setScrollLocked(locked: boolean) {
  if (locked) lenis?.stop()
  else lenis?.start()
  document.documentElement.classList.toggle('is-locked', locked)
}
