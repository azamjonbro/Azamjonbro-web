import { useEffect } from 'react'
import { pointer } from '@/lib/pointer'

/**
 * Tracks the pointer once, globally, in normalised coordinates.
 * Everything that reacts to the mouse reads from `pointer`.
 */
export function useCameraInteraction() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.nx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.ny = (e.clientY / window.innerHeight) * 2 - 1
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.active = true
    }

    const onLeave = () => {
      pointer.nx = 0
      pointer.ny = 0
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])
}
