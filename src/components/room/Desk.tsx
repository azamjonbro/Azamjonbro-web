import { useMemo } from 'react'
import * as THREE from 'three'
import { DESK } from '@/lib/layout'
import { createMarbleTexture, createNoiseRoughness } from '@/lib/textures'

/**
 * Marble-topped desk on a black steel frame, with the desk mat,
 * the under-lip LED strip and the cable run behind it.
 */
export function Desk() {
  const marble = useMemo(() => {
    const t = createMarbleTexture()
    t.repeat.set(1.6, 1)
    return t
  }, [])
  const marbleRough = useMemo(() => createNoiseRoughness(60, 40), [])

  const { width, depth, top, thickness } = DESK
  const halfW = width / 2
  const halfD = depth / 2

  return (
    <group position={DESK.center}>
      {/* Marble top */}
      <mesh position={[0, top - thickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, thickness, depth]} />
        <meshStandardMaterial
          map={marble}
          roughnessMap={marbleRough}
          roughness={0.22}
          metalness={0.04}
          envMapIntensity={1.1}
          color="#f0ede6"
        />
      </mesh>

      {/* Polished front edge catching the LED */}
      <mesh position={[0, top - thickness - 0.004, halfD - 0.002]}>
        <boxGeometry args={[width, 0.008, 0.006]} />
        <meshStandardMaterial color="#eceae4" roughness={0.18} metalness={0.05} />
      </mesh>

      {/* Desk mat */}
      <group position={[-0.12, top + 0.003, 0.06]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1.34, 0.56]} />
          <meshStandardMaterial color="#0d0d12" roughness={0.95} metalness={0.02} />
        </mesh>
        {/* Stitched edge */}
        <lineSegments position={[0, 0.001, 0]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(1.33, 0.55).rotateX(-Math.PI / 2)]} />
          <lineBasicMaterial color="#3b2a63" transparent opacity={0.75} />
        </lineSegments>
      </group>

      {/* Steel legs */}
      {([-1, 1] as const).map((side) => (
        <group key={side} position={[side * (halfW - 0.12), 0, 0]}>
          <mesh position={[0, top / 2, -halfD + 0.09]} castShadow>
            <boxGeometry args={[0.055, top - thickness, 0.055]} />
            <meshStandardMaterial color="#0e0e11" roughness={0.35} metalness={0.85} />
          </mesh>
          <mesh position={[0, top / 2, halfD - 0.09]} castShadow>
            <boxGeometry args={[0.055, top - thickness, 0.055]} />
            <meshStandardMaterial color="#0e0e11" roughness={0.35} metalness={0.85} />
          </mesh>
          {/* Foot rail */}
          <mesh position={[0, 0.022, 0]} castShadow>
            <boxGeometry args={[0.07, 0.04, depth - 0.1]} />
            <meshStandardMaterial color="#0b0b0e" roughness={0.35} metalness={0.9} />
          </mesh>
          {/* Apron rail */}
          <mesh position={[0, top - thickness - 0.05, 0]}>
            <boxGeometry args={[0.045, 0.045, depth - 0.2]} />
            <meshStandardMaterial color="#0e0e11" roughness={0.35} metalness={0.85} />
          </mesh>
        </group>
      ))}

      {/* Cross brace */}
      <mesh position={[0, 0.12, -halfD + 0.09]}>
        <boxGeometry args={[width - 0.28, 0.035, 0.035]} />
        <meshStandardMaterial color="#0b0b0e" roughness={0.35} metalness={0.9} />
      </mesh>

      {/* LED strip tucked under the back lip, washing the wall */}
      <group position={[0, top - thickness - 0.02, -halfD + 0.02]}>
        <mesh>
          <boxGeometry args={[width - 0.16, 0.01, 0.01]} />
          <meshStandardMaterial
            color="#c4b5fd"
            emissive="#8b5cf6"
            emissiveIntensity={4}
            toneMapped={false}
          />
        </mesh>
      </group>

      <Cables />
    </group>
  )
}

/* ─── CABLE RUN BEHIND THE DESK ───────────────────────────────── */
function Cables() {
  const curves = useMemo(() => {
    const make = (from: THREE.Vector3, to: THREE.Vector3, sag: number) =>
      new THREE.CatmullRomCurve3([
        from,
        new THREE.Vector3(
          (from.x + to.x) / 2,
          Math.min(from.y, to.y) - sag,
          (from.z + to.z) / 2 - 0.04,
        ),
        to,
      ])

    return [
      make(new THREE.Vector3(-0.05, 0.72, -0.38), new THREE.Vector3(-0.5, 0.2, -0.34), 0.16),
      make(new THREE.Vector3(0.32, 0.72, -0.36), new THREE.Vector3(0.62, 0.16, -0.32), 0.2),
      make(new THREE.Vector3(-0.62, 0.7, -0.36), new THREE.Vector3(-0.9, 0.22, -0.3), 0.14),
    ]
  }, [])

  return (
    <group>
      {curves.map((curve, i) => (
        <mesh key={i} castShadow>
          <tubeGeometry args={[curve, 22, 0.006, 6, false]} />
          <meshStandardMaterial color="#0a0a0d" roughness={0.55} metalness={0.1} />
        </mesh>
      ))}

      {/* USB hub sitting near the back edge */}
      <group position={[0.72, 0.762, -0.28]} rotation={[0, -0.18, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.11, 0.016, 0.045]} />
          <meshStandardMaterial color="#17171d" roughness={0.4} metalness={0.6} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-0.03 + i * 0.03, 0.009, 0]}>
            <boxGeometry args={[0.012, 0.001, 0.006]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#38bdf8"
              emissiveIntensity={2.4}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}
