import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Planet } from '@/data/planets'
import { useProceduralTexture } from '@/hooks/useTexture'
import { createCaption, createSurfaceTexture } from '@/lib/spaceTextures'
import { useWorld } from '@/state/WorldContext'

/**
 * Somewhere that is not the station.
 *
 * Deliberately not a second portfolio: there is nothing to read here and
 * nothing to interact with. It is the reward for going over the edge, it
 * says where you are, and it makes it obvious that the edge works in both
 * directions. Everything is built from the planet's four colours, so a new
 * world is a row in `data/planets` and nothing else.
 */

/** Deterministic, so a world looks the same every time you arrive on it. */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedOf(id: string) {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619)
  return h
}

interface Scatter {
  position: [number, number, number]
  scale: number
  rotation: [number, number, number]
  spire: boolean
}

export function Surface({ planet }: { planet: Planet }) {
  const { quality, reducedMotion } = useWorld()
  const seg = quality.ringSegments

  const ground = useProceduralTexture(
    () => createSurfaceTexture(planet.ground, planet.rock, planet.accent),
    [planet.id],
  )

  useMemo(() => {
    ground.repeat.set(planet.radius / 4, planet.radius / 4)
  }, [ground, planet.radius])

  /* Rocks and spires, placed once per world. The clearing in the middle is
     where you land, and a boulder in it would be the first thing you hit. */
  const scatter = useMemo<Scatter[]>(() => {
    const random = rng(seedOf(planet.id))
    const count = quality.tier === 'low' ? 34 : 70
    const items: Scatter[] = []

    for (let i = 0; i < count; i++) {
      const angle = random() * Math.PI * 2
      const distance = 13 + random() * (planet.radius - 16)
      const spire = random() > 0.78
      items.push({
        position: [Math.cos(angle) * distance, spire ? 0 : -0.35, Math.sin(angle) * distance],
        scale: spire ? 1.6 + random() * 3.4 : 0.5 + random() * 2.6,
        rotation: [random() * 0.4, random() * Math.PI, random() * 0.4],
        spire,
      })
    }
    return items
  }, [planet.id, planet.radius, quality.tier])

  const sign = useProceduralTexture(
    () => createCaption([planet.name, planet.caption], planet.accent, [50, 22]),
    [planet.id],
  )

  const beacon = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Mesh>(null)
  const label = useRef<THREE.Mesh>(null)
  const camera = useThree((state) => state.camera)

  useFrame((state, delta) => {
    /* The sign turns to face the camera. It stands at the origin, so that is
       one atan rather than a lookAt — and turning only about Y keeps it
       upright, which a lookAt would not. */
    if (label.current) {
      label.current.rotation.y = Math.atan2(camera.position.x, camera.position.z)
    }

    if (reducedMotion) return
    const t = state.clock.elapsedTime
    if (beacon.current) beacon.current.rotation.y += delta * 0.5
    if (halo.current) {
      /* One ripple leaving the landing pad every four seconds — the same
         language the station's destination pads use. */
      const phase = (t * 0.25) % 1
      halo.current.scale.setScalar(1 + phase * 3.4)
      ;(halo.current.material as THREE.MeshBasicMaterial).opacity = (1 - phase) * 0.34
    }
  })

  return (
    <group>
      {/* ── GROUND ─────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[planet.radius, seg]} />
        <meshStandardMaterial map={ground} color={planet.ground} roughness={0.95} metalness={0.05} />
      </mesh>

      {/* The slab, so the horizon is an edge you can fall off rather than
          a line where the world stops being drawn. */}
      <mesh position={[0, -2.2, 0]}>
        <cylinderGeometry args={[planet.radius, planet.radius * 0.82, 4.4, seg, 1, true]} />
        <meshStandardMaterial
          color={planet.rock}
          roughness={0.9}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Edge light. The only marked thing on the whole world, because it is
          the only thing you need to find again. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[planet.radius - 1.1, planet.radius - 0.2, seg]} />
        <meshBasicMaterial color={planet.accent} toneMapped={false} transparent opacity={0.5} />
      </mesh>

      {/* ── TERRAIN ────────────────────────────────────────────── */}
      {scatter.map((item, i) =>
        item.spire ? (
          <mesh key={i} position={item.position} rotation={item.rotation} castShadow>
            <coneGeometry args={[0.5 + item.scale * 0.12, item.scale * 2.4, 6]} />
            <meshStandardMaterial color={planet.rock} roughness={0.85} metalness={0.12} flatShading />
          </mesh>
        ) : (
          <mesh
            key={i}
            position={item.position}
            rotation={item.rotation}
            scale={[item.scale, item.scale * 0.62, item.scale]}
            castShadow
            receiveShadow
          >
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={planet.rock} roughness={0.92} metalness={0.08} flatShading />
          </mesh>
        ),
      )}

      {/* ── LANDING PAD ────────────────────────────────────────── */}
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[4.2, 4.6, 48]} />
          <meshBasicMaterial color={planet.accent} toneMapped={false} transparent opacity={0.45} />
        </mesh>
        <mesh ref={halo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
          <ringGeometry args={[4.2, 4.4, 48]} />
          <meshBasicMaterial color={planet.accent} toneMapped={false} transparent opacity={0.3} depthWrite={false} />
        </mesh>

        {/* The marker, and the only text on the planet. What to do about it
            is on the HUD; repeating it here would put the same sentence on
            the screen twice. */}
        <mesh ref={beacon} position={[0, 2.4, 0]}>
          <octahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial
            color={planet.accent}
            emissive={planet.accent}
            emissiveIntensity={1.8}
            roughness={0.3}
            metalness={0.4}
            toneMapped={false}
            flatShading
          />
        </mesh>
        <pointLight position={[0, 3, 0]} intensity={30} color={planet.accent} distance={30} decay={2} />

        <mesh ref={label} position={[0, 5.4, 0]}>
          <planeGeometry args={[9, 4.5]} />
          <meshBasicMaterial
            map={sign}
            transparent
            depthWrite={false}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* ── LIGHT ──────────────────────────────────────────────── */}
      {/* The station's key light still shines here; what changes is the
          bounce, which is the planet's own colour coming back up. */}
      <hemisphereLight args={[planet.accent, planet.ground, 0.55]} />
    </group>
  )
}
