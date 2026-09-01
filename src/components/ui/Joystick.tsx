import { useEffect, useRef } from 'react'
import { setStick } from '@/lib/input'
import { useWorld } from '@/state/WorldContext'

/**
 * The mobile movement control.
 *
 * A floating stick rather than a fixed one: it appears wherever the thumb
 * lands in the left half of the screen, which is the difference between a
 * control that works one-handed and one that requires looking down. The
 * right half is left free for camera swipes, handled by the shared pointer
 * listener in lib/input.
 */
const RADIUS = 58

export function Joystick() {
  const { stage, isTouch, blocked, retireHint, hintSeen } = useWorld()
  const zone = useRef<HTMLDivElement>(null)
  const base = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const pointerId = useRef<number | null>(null)
  const origin = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const node = zone.current
    if (!node || !isTouch) return

    const show = (x: number, y: number) => {
      if (!base.current) return
      base.current.style.transform = `translate3d(${x - RADIUS}px, ${y - RADIUS}px, 0)`
      base.current.style.opacity = '1'
      move(0, 0)
    }

    const move = (dx: number, dy: number) => {
      if (!knob.current) return
      knob.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`
    }

    const onDown = (e: PointerEvent) => {
      if (pointerId.current !== null || blocked) return
      pointerId.current = e.pointerId
      const rect = node.getBoundingClientRect()
      origin.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      show(origin.current.x, origin.current.y)
      node.setPointerCapture(e.pointerId)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId.current) return
      const rect = node.getBoundingClientRect()
      let dx = e.clientX - rect.left - origin.current.x
      let dy = e.clientY - rect.top - origin.current.y

      const distance = Math.hypot(dx, dy)
      if (distance > RADIUS) {
        dx = (dx / distance) * RADIUS
        dy = (dy / distance) * RADIUS
      }

      move(dx, dy)
      /* A small dead zone, so resting a thumb does not drift the avatar. */
      const nx = Math.abs(dx) < 6 ? 0 : dx / RADIUS
      const ny = Math.abs(dy) < 6 ? 0 : dy / RADIUS
      setStick(nx, ny)
      if (!hintSeen && (nx || ny)) retireHint()
    }

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId.current) return
      pointerId.current = null
      setStick(0, 0)
      move(0, 0)
      if (base.current) base.current.style.opacity = '0'
      node.releasePointerCapture?.(e.pointerId)
    }

    node.addEventListener('pointerdown', onDown)
    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerup', onUp)
    node.addEventListener('pointercancel', onUp)

    return () => {
      node.removeEventListener('pointerdown', onDown)
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerup', onUp)
      node.removeEventListener('pointercancel', onUp)
      setStick(0, 0)
    }
  }, [isTouch, blocked, hintSeen, retireHint])

  if (!isTouch || stage !== 'entered') return null

  return (
    <div className={`stick-zone${blocked ? ' is-off' : ''}`} ref={zone} aria-hidden>
      <div className="stick-base" ref={base}>
        <div className="stick-knob" ref={knob} />
      </div>
    </div>
  )
}
