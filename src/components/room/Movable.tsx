import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { MovableId, Placement, Vec3 } from '@/data/placements'
import { useRoom } from '@/state/RoomContext'

/** How far a wall-mounted display is allowed to travel, in metres. */
const WALL_BOUNDS = { x: [-1.95, 1.95], y: [0.4, 2.7] } as const
const ROOM_BOUNDS = { x: [-2.0, 2.0], z: [-1.7, 1.6] } as const

/**
 * Applies an object's stored transform, and — in rearrange mode — lets it be
 * dragged along the surface it lives on.
 *
 * Desk and floor props slide on a horizontal plane at their own height, so a
 * mug never sinks into the desk; wall displays slide on the plane of the wall.
 * Height and rotation are adjusted from the editor panel or the keyboard.
 */
export function Movable({ id, children }: { id: MovableId; children: ReactNode }) {
  const { layout, editMode, editing, setEditing, setPlacement, setDragging } = useRoom()
  const placement = layout[id]
  const selected = editing === id

  const plane = useMemo(() => new THREE.Plane(), [])
  const hit = useMemo(() => new THREE.Vector3(), [])
  const grabOffset = useRef(new THREE.Vector3())
  const active = useRef(false)

  /** The plane this object slides along, positioned at its current transform. */
  const setDragPlane = () => {
    const [x, y, z] = placement.position
    if (placement.plane === 'wall') {
      plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), new THREE.Vector3(x, y, z))
    } else {
      plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x, y, z))
    }
  }

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!editMode) return
    e.stopPropagation()
    setEditing(id)

    setDragPlane()
    if (!e.ray.intersectPlane(plane, hit)) return

    grabOffset.current.set(...placement.position).sub(hit)
    active.current = true
    setDragging(true)
    ;(e.target as Element)?.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!active.current) return
    e.stopPropagation()
    if (!e.ray.intersectPlane(plane, hit)) return

    hit.add(grabOffset.current)

    const next: Vec3 =
      placement.plane === 'wall'
        ? [
            clamp(hit.x, WALL_BOUNDS.x[0], WALL_BOUNDS.x[1]),
            clamp(hit.y, WALL_BOUNDS.y[0], WALL_BOUNDS.y[1]),
            placement.position[2],
          ]
        : [
            clamp(hit.x, ROOM_BOUNDS.x[0], ROOM_BOUNDS.x[1]),
            placement.position[1],
            clamp(hit.z, ROOM_BOUNDS.z[0], ROOM_BOUNDS.z[1]),
          ]

    setPlacement(id, { position: next })
  }

  const endDrag = (e: ThreeEvent<PointerEvent>) => {
    if (!active.current) return
    active.current = false
    setDragging(false)
    ;(e.target as Element)?.releasePointerCapture?.(e.pointerId)
  }

  return (
    <group
      position={placement.position}
      rotation={placement.rotation}
      onPointerDown={editMode ? onPointerDown : undefined}
      onPointerMove={editMode ? onPointerMove : undefined}
      onPointerUp={editMode ? endDrag : undefined}
      onPointerCancel={editMode ? endDrag : undefined}
    >
      {children}

      {/* Marker under the object, so it is obvious what the editor is holding. */}
      {editMode && <Marker selected={selected} plane={placement.plane} />}
    </group>
  )
}

/** A flat disc under the object while rearranging, brighter when selected. */
function Marker({ selected, plane }: { selected: boolean; plane: Placement['plane'] }) {
  const ring = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ring.current) return
    const m = ring.current.material as THREE.MeshBasicMaterial
    m.opacity = selected ? 0.5 + Math.sin(clock.getElapsedTime() * 3.4) * 0.22 : 0.16
  })

  const wall = plane === 'wall'

  return (
    <mesh
      ref={ring}
      position={wall ? [0, 0, -0.02] : [0, 0.002, 0]}
      rotation={wall ? [0, 0, 0] : [-Math.PI / 2, 0, 0]}
      renderOrder={2}
    >
      <ringGeometry args={wall ? [0.38, 0.42, 40] : [0.11, 0.135, 40]} />
      <meshBasicMaterial
        color={selected ? '#a78bfa' : '#7d84a8'}
        transparent
        opacity={0.16}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  )
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}
