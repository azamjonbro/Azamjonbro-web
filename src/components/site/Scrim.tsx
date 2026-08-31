import { useEffect, useRef } from 'react'
import { scroll } from '@/lib/scroll'

/**
 * The layer that keeps the page readable over the room.
 *
 * The hero deliberately has none of it — the room is meant to be seen
 * unobstructed — and it comes up over the first screen of scrolling, so
 * body copy never sits directly on a lit 3D surface.
 */
export function Scrim() {
  const el = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    let current = 0

    const tick = () => {
      const vh = window.innerHeight
      const wanted = Math.min(1, Math.max(0, (scroll.y - vh * 0.25) / (vh * 0.6)))
      /* Damped, so a flicked trackpad does not strobe the background. */
      current += (wanted - current) * 0.12
      if (el.current) el.current.style.opacity = current.toFixed(3)
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <div className="scrim" ref={el} aria-hidden />
}
