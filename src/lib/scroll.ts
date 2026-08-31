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
  /** 0 → 1 across the whole scrollable document. */
  progress: 0,
  /** Pixels per frame, signed. Used for the velocity-driven skew. */
  velocity: 0,
  /**
   * Position along the section list as a float: the integer part is the
   * section, the fraction is the eased transition into the next one.
   * This is what drives the camera.
   */
  stage: 0,
  /** The section the visitor is currently reading. */
  section: 0,
  /** True once the page has been scrolled at all. */
  moved: false,
}

/* ─── SECTION REGISTRY ────────────────────────────────────────── */

interface Tracked {
  id: string
  el: HTMLElement
  top: number
  height: number
}

/** Document order is authoritative, so entries are re-sorted on measure. */
let tracked: Tracked[] = []

export function registerSection(id: string, el: HTMLElement) {
  tracked.push({ id, el, top: 0, height: 0 })
  measureSections()
  return () => {
    tracked = tracked.filter((t) => t.el !== el)
  }
}

export function measureSections() {
  for (const t of tracked) {
    const box = t.el.getBoundingClientRect()
    t.top = box.top + window.scrollY
    t.height = box.height
  }
  tracked.sort((a, b) => a.top - b.top)
}

/** Smoothstep, so the camera settles inside a section instead of sliding through it. */
const ease = (t: number) => t * t * (3 - 2 * t)

/**
 * Where the camera should be, given a scroll position.
 * The anchor sits above the viewport centre so a section "arrives"
 * as its heading reaches comfortable reading height.
 */
function computeStage(y: number) {
  if (tracked.length === 0) return 0
  const anchor = y + window.innerHeight * 0.42

  if (anchor <= tracked[0].top) return 0
  const last = tracked.length - 1
  if (anchor >= tracked[last].top) return last

  for (let i = 0; i < last; i++) {
    const a = tracked[i]
    const b = tracked[i + 1]
    if (anchor < b.top) {
      const span = b.top - a.top
      const f = span > 0 ? (anchor - a.top) / span : 0
      /* Hold the shot through the body of the section, then move.
         Without this the camera never rests anywhere. */
      const shaped = f < 0.45 ? 0 : ease((f - 0.45) / 0.55)
      return i + shaped
    }
  }

  return last
}

/* ─── ACTIVE SECTION SUBSCRIPTION ─────────────────────────────── */

type Listener = (index: number) => void
const listeners = new Set<Listener>()

export function onSectionChange(fn: Listener) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function sectionIndexOf(id: string) {
  return tracked.findIndex((t) => t.id === id)
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

  let previous = window.scrollY

  const tick = (time: number) => {
    lenis?.raf(time)

    const y = window.scrollY
    const limit = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)

    scroll.velocity = y - previous
    previous = y
    scroll.y = y
    scroll.progress = Math.min(1, y / limit)
    scroll.stage = computeStage(y)
    if (y > 4) scroll.moved = true

    const next = Math.round(scroll.stage)
    if (next !== scroll.section) {
      scroll.section = next
      for (const fn of listeners) fn(next)
    }

    raf = requestAnimationFrame(tick)
  }

  raf = requestAnimationFrame(tick)

  const onResize = () => measureSections()
  window.addEventListener('resize', onResize)
  /* Late-loading images and fonts move every section below them. */
  const settle = setTimeout(measureSections, 600)

  cleanup = () => {
    cancelAnimationFrame(raf)
    clearTimeout(settle)
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
