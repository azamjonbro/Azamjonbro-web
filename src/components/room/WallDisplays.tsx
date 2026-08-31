import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { WALL_DISPLAYS } from '@/lib/layout'
import { createWallDisplayTexture } from '@/lib/textures'
import { useRoom } from '@/state/RoomContext'
import type { ObjectId } from '@/data/interactiveObjects'
import { Hotspot } from './Hotspot'
import { useProceduralTexture } from '@/hooks/useTexture'

/** Three wall-mounted project panels, plus the shelf and LED beneath them. */
export function WallDisplays() {
  return (
    <group>
      {WALL_DISPLAYS.rows.map((row) => (
        <Panel key={row.id} id={row.id as ObjectId} y={row.y} />
      ))}
      <DisplayShelf />
    </group>
  )
}

function Panel({ id, y }: { id: ObjectId; y: number }) {
  const texture = useProceduralTexture(() => createWallDisplayTexture(id), [id])
  const { hovered } = useRoom()
  const isHovered = hovered?.id === id

  const screen = useRef<THREE.MeshBasicMaterial>(null)
  const halo = useRef<THREE.PointLight>(null)

  useFrame(() => {
    const target = isHovered ? 1.25 : 0.92
    if (screen.current)
      screen.current.color.lerp(new THREE.Color(target, target, target), 0.12)
    if (halo.current)
      halo.current.intensity = THREE.MathUtils.lerp(halo.current.intensity, isHovered ? 1.4 : 0.5, 0.12)
  })

  const { width, height, x, z } = WALL_DISPLAYS

  return (
    <Hotspot id={id}>
      <group position={[x, y, z]}>
        {/* Bezel */}
        <mesh position={[0, 0, -0.012]} castShadow>
          <boxGeometry args={[width + 0.022, height + 0.022, 0.026]} />
          <meshStandardMaterial color="#0a0a0e" roughness={0.42} metalness={0.5} />
        </mesh>

        {/* Glass panel */}
        <mesh position={[0, 0, 0.002]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial ref={screen} map={texture} toneMapped={false} />
        </mesh>

        {/* Reflective glass sheen over the artwork */}
        <mesh position={[0, 0, 0.004]}>
          <planeGeometry args={[width, height]} />
          <meshPhysicalMaterial
            transparent
            opacity={0.09}
            roughness={0.08}
            metalness={0}
            color="#cfd8ff"
          />
        </mesh>

        <pointLight ref={halo} position={[0, 0, 0.32]} intensity={0.5} color="#8b5cf6" distance={1.3} decay={2} />
      </group>
    </Hotspot>
  )
}

/* ─── SHELF AND LED UNDER THE BOTTOM PANEL ────────────────────── */
function DisplayShelf() {
  const { x, z } = WALL_DISPLAYS

  return (
    <group position={[x, 0.82, z + 0.11]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.92, 0.036, 0.24]} />
        <meshStandardMaterial color="#16151c" roughness={0.45} metalness={0.32} />
      </mesh>

      {/* Purple LED under the shelf lip */}
      <mesh position={[0, -0.026, 0.1]}>
        <boxGeometry args={[0.88, 0.008, 0.008]} />
        <meshStandardMaterial
          color="#c4b5fd"
          emissive="#8b5cf6"
          emissiveIntensity={4}
          toneMapped={false}
        />
      </mesh>

      {/* Cabinet body below */}
      <mesh position={[0, -0.42, -0.01]} castShadow receiveShadow>
        <boxGeometry args={[0.88, 0.8, 0.22]} />
        <meshStandardMaterial color="#111017" roughness={0.7} metalness={0.15} />
      </mesh>
      <mesh position={[0, -0.42, 0.102]}>
        <boxGeometry args={[0.84, 0.74, 0.006]} />
        <meshStandardMaterial color="#181722" roughness={0.6} metalness={0.2} />
      </mesh>
    </group>
  )
}
