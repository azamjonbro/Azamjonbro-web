import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Zone } from '@/data/zones'
import { useProceduralTexture } from '@/hooks/useTexture'
import { createHoloSurface, createZoneSign } from '@/lib/spaceTextures'
import { useWorld } from '@/state/WorldContext'

/**
 * A destination pad: a lit disc on the deck and a holographic sign above it.
 *
 * The pad is the interaction target and the sign is what you read from
 * across the station, which is why the sign is a billboard-free flat plane —
 * it faces the hub, so walking the ring reveals each one in turn rather than
 * showing every label at once.
 */
export function ZoneMarker({ zone, children }: { zone: Zone; children?: React.ReactNode }) {
  const { nearZone, reducedMotion } = useWorld()
  const active = nearZone === zone.id

  const sign = useProceduralTexture(
    () => createZoneSign(zone.label, zone.caption, zone.accent),
    [zone.label, zone.caption, zone.accent],
  )
  const holo = useProceduralTexture(() => createHoloSurface(256, 256, zone.accent), [zone.accent])

  const ring = useRef<THREE.Mesh>(null)
  const signGroup = useRef<THREE.Group>(null)
  const glow = useRef<THREE.PointLight>(null)
  const pulse = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const dt = Math.min(delta, 0.1)

    /* Everything about a pad brightens on approach; nothing is on full
       brightness until then, which is what keeps the station from glowing
       uniformly in every direction. */
    if (ring.current) {
      const material = ring.current.material as THREE.MeshBasicMaterial
      const wanted = active ? 0.95 : 0.34
      material.opacity += (wanted - material.opacity) * dt * 6
    }
    if (glow.current) {
      const wanted = active ? 26 : 9
      glow.current.intensity += (wanted - glow.current.intensity) * dt * 5
    }
    if (signGroup.current && !reducedMotion) {
      signGroup.current.position.y = 4.3 + Math.sin(t * 0.9 + zone.position.x) * 0.12
    }
    if (pulse.current) {
      const material = pulse.current.material as THREE.MeshBasicMaterial
      if (reducedMotion) {
        material.opacity = active ? 0.2 : 0
        pulse.current.scale.setScalar(1)
      } else {
        /* One expanding ripple, restarting every four seconds. */
        const phase = (t * 0.25 + zone.position.z * 0.03) % 1
        pulse.current.scale.setScalar(0.35 + phase * 1.1)
        material.opacity = (1 - phase) * (active ? 0.45 : 0.18)
      }
    }
  })

  return (
    <group position={zone.position.toArray()} rotation={[0, zone.rotation, 0]}>
      {/* Pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
        <circleGeometry args={[zone.radius * 0.62, 48]} />
        <meshStandardMaterial color="#151a24" roughness={0.6} metalness={0.7} />
      </mesh>

      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <ringGeometry args={[zone.radius * 0.55, zone.radius * 0.62, 64]} />
        <meshBasicMaterial color={zone.accent} transparent opacity={0.34} toneMapped={false} />
      </mesh>

      <mesh ref={pulse} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <ringGeometry args={[zone.radius * 0.5, zone.radius * 0.56, 48]} />
        <meshBasicMaterial color={zone.accent} transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>

      <pointLight position={[0, 1.6, 0]} intensity={9} color={zone.accent} distance={18} decay={2} ref={glow} />

      {/* Sign */}
      <group ref={signGroup} position={[0, 4.3, 0]}>
        <mesh>
          <planeGeometry args={[6.4, 3.2]} />
          <meshBasicMaterial
            map={sign}
            transparent
            depthWrite={false}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* The pane the sign is projected onto. */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[6.6, 3.4]} />
          <meshBasicMaterial
            map={holo}
            transparent
            opacity={0.3}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Frame corners */}
        {[[-3.3, 1.7], [3.3, 1.7], [-3.3, -1.7], [3.3, -1.7]].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0]}>
            <boxGeometry args={[0.5, 0.05, 0.05]} />
            <meshBasicMaterial color={zone.accent} toneMapped={false} transparent opacity={0.75} />
          </mesh>
        ))}
      </group>

      {/* Emitter posts */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 3.1, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.2, 2.2, 10]} />
          <meshStandardMaterial color="#1c222c" roughness={0.5} metalness={0.85} />
        </mesh>
      ))}

      {children}
    </group>
  )
}
