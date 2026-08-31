import { useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useRoom } from '@/state/RoomContext'
import type { ObjectId } from '@/data/interactiveObjects'
import { uiSounds } from '@/lib/uiSounds'

/**
 * Shared hover / click behaviour for every interactive object in the room,
 * so the cursor, tooltip and info panel always stay in sync.
 */
export function useObjectInteraction(id: ObjectId, onSelect?: () => void) {
  const { hover, select, hovered } = useRoom()
  const isHovered = hovered?.id === id

  const handlers = useMemo(
    () => ({
      onPointerOver: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        hover(id)
        uiSounds.hover()
        document.body.style.cursor = 'pointer'
      },
      onPointerOut: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        hover(null)
        document.body.style.cursor = 'auto'
      },
      onClick: (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        if (onSelect) onSelect()
        else select(id)
      },
    }),
    [id, hover, select, onSelect],
  )

  return { ...handlers, isHovered }
}
