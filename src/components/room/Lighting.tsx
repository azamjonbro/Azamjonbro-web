import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { monitorPanelWorld } from '@/lib/layout'
import { useRoom } from '@/state/RoomContext'

/**
 * Six sources carry the room: a low ambient base, a warm key,
 * the monitor's own glow, the LED strip, the ring light (in Props)
 * and the blue city fill through the window.
 */
/** Keeps the screen's spill light on the panel wherever the panel is moved to. */
function glowAt(base: { position: [number, number, number]; rotation: [number, number, number] }) {
  const { position } = monitorPanelWorld(base)
  return [position.x, position.y, position.z + 0.3] as [number, number, number]
}

export function Lighting() {
  const { isMobile, selected, layout } = useRoom()
  const monitorGlow = useRef<THREE.PointLight>(null)

  /* The screen brightens a little while its panel is open. */
  useFrame(() => {
    if (!monitorGlow.current) return
    const target = selected?.id === 'monitor' ? 4.4 : 2.6
    monitorGlow.current.intensity = THREE.MathUtils.lerp(monitorGlow.current.intensity, target, 0.07)
  })

  return (
    <>
      <ambientLight intensity={0.34} color="#232535" />

      {/* Warm key from the upper front-right */}
      <directionalLight
        position={[1.9, 3.2, 1.9]}
        intensity={1.15}
        color="#ffeedd"
        castShadow={!isMobile}
        shadow-mapSize={isMobile ? [512, 512] : [2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-1.5}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
      />

      {/* Monitor glow spilling onto the desk and back wall */}
      <pointLight
        ref={monitorGlow}
        position={glowAt(layout.monitor)}
        intensity={2.6}
        color="#8b7bff"
        distance={2.2}
        decay={2}
      />

      {/* Cool fill from the visitor's side, balancing the warm key */}
      <pointLight position={[0.1, 1.7, 1.3]} intensity={2.4} color="#9fb0e8" distance={4} decay={2} />

      {/* Warm fill just above the desk, so the marble stays stone-coloured */}
      <pointLight position={[0.25, 1.75, -0.55]} intensity={2.6} color="#ffe6c8" distance={3.2} decay={2} />

      {/* LED strip wash behind the desk */}
      <pointLight position={[0.25, 0.72, -1.6]} intensity={1.9} color="#7c3aed" distance={2} decay={2} />

      {/* Cool city fill through the window */}
      <pointLight position={[1.25, 1.75, -1.5]} intensity={2.8} color="#3b6fd8" distance={3.4} decay={2} />

      {/* Wall-display bounce on the far left */}
      <pointLight position={[-1.45, 1.6, -1.2]} intensity={1.1} color="#a78bfa" distance={2.4} decay={2} />

      {/* Very soft ceiling bounce so the upper walls are not pure black */}
      <hemisphereLight args={['#33344f', '#0d0d14', 0.45]} />
    </>
  )
}

/* ─── DUST IN THE LIGHT SHAFTS ────────────────────────────────── */
export function DustMotes() {
  const { isMobile, reducedMotion } = useRoom()
  const count = isMobile ? 30 : 90
  const points = useRef<THREE.Points>(null)

  const positions = useRef<Float32Array>(null)
  if (!positions.current) {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 4
      arr[i * 3 + 1] = Math.random() * 2.6
      arr[i * 3 + 2] = (Math.random() - 0.5) * 3.2
    }
    positions.current = arr
  }

  useFrame((_, delta) => {
    if (reducedMotion || !points.current) return
    const attr = points.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += delta * 0.012
      if (arr[i * 3 + 1] > 2.6) arr[i * 3 + 1] = 0.05
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.007}
        color="#d9c8ff"
        transparent
        opacity={0.22}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
