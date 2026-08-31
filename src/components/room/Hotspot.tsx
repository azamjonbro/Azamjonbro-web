import type { ReactNode } from 'react'
import { Select } from '@react-three/postprocessing'
import type { ObjectId } from '@/data/interactiveObjects'
import { useObjectInteraction } from '@/hooks/useObjectInteraction'

interface HotspotProps {
  id: ObjectId
  children: ReactNode
  position?: [number, number, number]
  rotation?: [number, number, number]
  /** Overrides the default "open the info panel" click behaviour. */
  onSelect?: () => void
}

/**
 * An invisible, unrendered collider that gives a small prop a hit area
 * a person can actually land on. Raycasting ignores `visible`, so this
 * costs nothing to draw.
 */
export function HitBox({
  size,
  position = [0, 0, 0],
  rotation,
}: {
  size: [number, number, number]
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  return (
    <mesh position={position} rotation={rotation} visible={false}>
      <boxGeometry args={size} />
    </mesh>
  )
}

/**
 * Wraps any prop in the room and gives it the shared interaction contract:
 * pointer cursor, tooltip, outline on hover, info panel on click.
 * The outline itself is drawn by the post-processing Outline effect.
 */
export function Hotspot({ id, children, position, rotation, onSelect }: HotspotProps) {
  const { isHovered, ...handlers } = useObjectInteraction(id, onSelect)

  return (
    <Select enabled={isHovered}>
      <group position={position} rotation={rotation} {...handlers}>
        {children}
      </group>
    </Select>
  )
}
