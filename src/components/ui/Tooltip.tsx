import { useEffect, useRef } from 'react'
import { pointer } from '@/lib/pointer'
import { useRoom } from '@/state/RoomContext'

/**
 * Follows the cursor and names whatever is under it.
 * Position is written straight to the DOM each frame so hovering
 * never triggers a React render.
 */
export function Tooltip() {
  const { hovered, view } = useRoom()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const el = ref.current
      if (el) {
        el.style.transform = `translate3d(${pointer.x + 18}px, ${pointer.y + 18}px, 0)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const visible = Boolean(hovered) && view === 'room'

  return (
    <div ref={ref} className={`tooltip${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
      <span className="tooltip-dot" />
      <span className="tooltip-label">{hovered?.label ?? ''}</span>
      <span className="tooltip-hint">click to inspect</span>
    </div>
  )
}
