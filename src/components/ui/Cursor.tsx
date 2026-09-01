import { useEffect, useRef } from 'react'
import { input } from '@/lib/input'
import { useWorld } from '@/state/WorldContext'

/**
 * A dot that follows the pointer and opens up over anything clickable.
 *
 * Written straight to the node on a frame loop; a cursor that re-rendered
 * React on every pointer move would be the most expensive element on screen.
 * Never shown on touch, where there is no cursor to replace.
 */
export function Cursor() {
  const { isTouch, reducedMotion } = useWorld()
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isTouch) return

    let raf = 0
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

    const over = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      const hit = target?.closest('a, button, [role="button"]')
      ring.current?.classList.toggle('is-hot', Boolean(hit))
    }

    const tick = () => {
      if (dot.current) {
        dot.current.style.transform = `translate3d(${input.px}px, ${input.py}px, 0)`
      }
      if (ring.current) {
        /* The ring trails the dot — the lag is the whole effect. */
        const ease = reducedMotion ? 1 : 0.18
        pos.x += (input.px - pos.x) * ease
        pos.y += (input.py - pos.y) * ease
        ring.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointerover', over)
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('pointerover', over)
      cancelAnimationFrame(raf)
    }
  }, [isTouch, reducedMotion])

  if (isTouch) return null

  return (
    <>
      <div className="cursor-dot" ref={dot} aria-hidden />
      <div className="cursor-ring" ref={ring} aria-hidden />
    </>
  )
}
