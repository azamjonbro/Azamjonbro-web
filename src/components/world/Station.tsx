import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useProceduralTexture } from '@/hooks/useTexture'
import {
  createDeckGrid,
  createPlatingRoughness,
  createPlatingTexture,
} from '@/lib/spaceTextures'
import { STATION_RADIUS, zones } from '@/data/zones'
import { useWorld } from '@/state/WorldContext'

/**
 * The station the visitor walks on.
 *
 * A central hub, a deck reaching out to the destination ring, and a
 * structural rim that closes the silhouette. The geometry is deliberately
 * simple and the detail lives in the plating and the light strips — an
 * elegant shape lit well beats a complicated one lit poorly, and it costs a
 * fraction of the triangles.
 */
export function Station() {
  const { quality } = useWorld()
  const seg = quality.ringSegments

  const plating = useProceduralTexture(createPlatingTexture)
  const roughness = useProceduralTexture(createPlatingRoughness)
  const deck = useProceduralTexture(createDeckGrid)

  useMemo(() => {
    deck.repeat.set(14, 14)
    plating.repeat.set(8, 2)
    roughness.repeat.set(8, 2)
  }, [deck, plating, roughness])

  return (
    <group>
      {/* ── DECK ───────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[STATION_RADIUS, seg]} />
        <meshStandardMaterial
          map={deck}
          roughnessMap={roughness}
          color="#2a3140"
          roughness={0.72}
          metalness={0.55}
        />
      </mesh>

      {/* Underside, so the deck reads as a slab rather than a decal. */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1.4, 0]}>
        <circleGeometry args={[STATION_RADIUS, seg]} />
        <meshStandardMaterial color="#0b0d13" roughness={0.9} metalness={0.4} />
      </mesh>
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[STATION_RADIUS, STATION_RADIUS - 1.2, 1.4, seg, 1, true]} />
        <meshStandardMaterial
          map={plating}
          roughnessMap={roughness}
          color="#20252f"
          roughness={0.6}
          metalness={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── EDGE LIGHT ─────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[STATION_RADIUS - 0.35, STATION_RADIUS - 0.05, seg]} />
        <meshBasicMaterial color="#5ad1ff" toneMapped={false} transparent opacity={0.85} />
      </mesh>

      <Hub />
      <Spokes />
      <Rim />
      <Beacons />
    </group>
  )
}

/* ─── CENTRAL HUB ─────────────────────────────────────────────── */

/**
 * The spawn point, and the one piece of the station that moves. The slowly
 * counter-rotating rings give the visitor a fixed reference for how far they
 * have walked and which way they are facing.
 */
function Hub() {
  const { quality, reducedMotion } = useWorld()
  const plating = useProceduralTexture(createPlatingTexture)
  const outer = useRef<THREE.Mesh>(null)
  const inner = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (reducedMotion) return
    if (outer.current) outer.current.rotation.y += delta * 0.08
    if (inner.current) inner.current.rotation.y -= delta * 0.13
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Raised platform */}
      <mesh position={[0, 0.14, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[6.4, 6.8, 0.28, quality.ringSegments]} />
        <meshStandardMaterial
          map={plating}
          color="#252b37"
          roughness={0.55}
          metalness={0.8}
        />
      </mesh>

      <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.0, 6.3, 64]} />
        <meshBasicMaterial color="#5ad1ff" toneMapped={false} transparent opacity={0.55} />
      </mesh>

      {/* Core column and the light it throws on the deck */}
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.5, 0.75, 6.2, 24]} />
        <meshStandardMaterial color="#1a1f29" roughness={0.4} metalness={0.9} />
      </mesh>
      <mesh position={[0, 6.6, 0]}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshStandardMaterial
          color="#8fd8ff"
          emissive="#5ad1ff"
          emissiveIntensity={2.4}
          roughness={0.25}
          metalness={0.3}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, 6.6, 0]} intensity={38} color="#5ad1ff" distance={34} decay={2} />

      {/* Gyro rings */}
      <mesh ref={outer} position={[0, 6.6, 0]} rotation={[0.42, 0, 0.2]}>
        <torusGeometry args={[2.5, 0.055, 8, 72]} />
        <meshStandardMaterial color="#7fd0ff" emissive="#3aa8e0" emissiveIntensity={1.1} metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh ref={inner} position={[0, 6.6, 0]} rotation={[-0.5, 0.4, -0.3]}>
        <torusGeometry args={[1.85, 0.04, 8, 64]} />
        <meshStandardMaterial color="#9fdcff" emissive="#3aa8e0" emissiveIntensity={0.8} metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  )
}

/* ─── WALKWAYS ────────────────────────────────────────────────── */

/** One lit spoke per destination, so the deck tells you where to go. */
function Spokes() {
  return (
    <group>
      {zones.map((zone) => {
        const angle = Math.atan2(zone.position.z, zone.position.x)
        const length = Math.hypot(zone.position.x, zone.position.z)
        return (
          <group key={zone.id} rotation={[0, -angle, 0]}>
            <mesh position={[length / 2, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[length, 3.4]} />
              <meshStandardMaterial color="#171c26" roughness={0.65} metalness={0.6} />
            </mesh>
            {/* Two hairlines rather than a glowing strip. */}
            {[-1.3, 1.3].map((offset) => (
              <mesh
                key={offset}
                position={[length / 2, 0.045, offset]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[length - 2, 0.07]} />
                <meshBasicMaterial
                  color={zone.accent}
                  toneMapped={false}
                  transparent
                  opacity={0.5}
                />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}

/* ─── STRUCTURAL RIM ──────────────────────────────────────────── */

function Rim() {
  const { quality } = useWorld()
  const plating = useProceduralTexture(createPlatingTexture)

  /* Ribs at fixed angles rather than at random: a structure repeats. */
  const ribs = useMemo(
    () => Array.from({ length: 24 }, (_, i) => (i / 24) * Math.PI * 2),
    [],
  )

  return (
    <group>
      {/* The torus is authored in the XY plane; the rotation belongs to the
          mesh, not to the geometry. */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[STATION_RADIUS, 0.42, 10, quality.ringSegments]} />
        <meshStandardMaterial map={plating} color="#242a35" roughness={0.5} metalness={0.85} />
      </mesh>

      {ribs.map((angle, i) => (
        <group key={i} rotation={[0, -angle, 0]}>
          <mesh position={[STATION_RADIUS - 0.4, -1.3, 0]} castShadow>
            <boxGeometry args={[1.1, 2.6, 0.5]} />
            <meshStandardMaterial color="#1b202a" roughness={0.55} metalness={0.8} />
          </mesh>
          {i % 3 === 0 && (
            <mesh position={[STATION_RADIUS - 0.4, -2.5, 0]}>
              <boxGeometry args={[0.5, 0.09, 0.09]} />
              <meshBasicMaterial color="#5ad1ff" toneMapped={false} transparent opacity={0.7} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

/* ─── NAVIGATION BEACONS ──────────────────────────────────────── */

/** Slow pulses at the rim — the only thing in the scene that blinks. */
function Beacons() {
  const { reducedMotion } = useWorld()
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (reducedMotion || !group.current) return
    const t = state.clock.elapsedTime
    group.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const material = mesh.material as THREE.MeshBasicMaterial
      material.opacity = 0.25 + Math.abs(Math.sin(t * 0.9 + i * 1.7)) * 0.65
    })
  })

  return (
    <group ref={group}>
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * (STATION_RADIUS - 1.4),
              1.5,
              Math.sin(angle) * (STATION_RADIUS - 1.4),
            ]}
          >
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshBasicMaterial color="#ff6b6b" toneMapped={false} transparent opacity={0.6} />
          </mesh>
        )
      })}
    </group>
  )
}
