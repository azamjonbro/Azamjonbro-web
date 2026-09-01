import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { allSkills } from '@/data/skills'
import { missions } from '@/data/experience'
import { processSteps } from '@/data/process'
import { lab } from '@/data/site'
import { getZone } from '@/data/zones'
import { useProceduralTexture } from '@/hooks/useTexture'
import { createCaption } from '@/lib/spaceTextures'
import { useWorld } from '@/state/WorldContext'

/**
 * The structure standing on each destination pad.
 *
 * Every one is driven by the same data the panel renders, so a technology
 * added to `skills.ts` becomes a node in the constellation without anyone
 * remembering to add it twice.
 */

/* ─── SKILLS ──────────────────────────────────────────────────── */

/**
 * A constellation, seeded deterministically.
 *
 * Random placement re-rolled on every mount would make the section look
 * different each visit; seeding from the index keeps it a fixed shape that
 * happens to look organic.
 */
export function SkillConstellation() {
  const { nearZone, reducedMotion } = useWorld()
  const active = nearZone === 'skills'
  const group = useRef<THREE.Group>(null)

  const nodes = useMemo(
    () =>
      allSkills.map((skill, i) => {
        const golden = Math.PI * (3 - Math.sqrt(5))
        const t = i / Math.max(1, allSkills.length - 1)
        const inclination = Math.acos(1 - 2 * (t * 0.82 + 0.09))
        const azimuth = golden * i
        const radius = 3.2

        return {
          key: `${skill.group}-${skill.name}`,
          accent: skill.accent,
          position: new THREE.Vector3(
            Math.sin(inclination) * Math.cos(azimuth) * radius,
            Math.cos(inclination) * radius * 0.72,
            Math.sin(inclination) * Math.sin(azimuth) * radius,
          ),
        }
      }),
    [],
  )

  /* Links between neighbours in the same group, built once. */
  const links = useMemo(() => {
    const positions: number[] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (allSkills[i].group !== allSkills[j].group) continue
        if (nodes[i].position.distanceTo(nodes[j].position) > 2.9) continue
        positions.push(...nodes[i].position.toArray(), ...nodes[j].position.toArray())
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [nodes])

  useFrame((_, delta) => {
    if (!group.current) return
    if (!reducedMotion) group.current.rotation.y += delta * (active ? 0.16 : 0.06)
    const scale = active ? 1 : 0.86
    group.current.scale.lerp(new THREE.Vector3(scale, scale, scale), Math.min(delta, 0.1) * 4)
  })

  const zone = getZone('skills')

  return (
    <group position={[zone.position.x, 5.4, zone.position.z]}>
      <group ref={group}>
        <lineSegments geometry={links}>
          <lineBasicMaterial
            color="#5ad1ff"
            transparent
            opacity={active ? 0.28 : 0.12}
            depthWrite={false}
            toneMapped={false}
          />
        </lineSegments>

        {nodes.map((node) => (
          <mesh key={node.key} position={node.position.toArray()}>
            <icosahedronGeometry args={[0.15, 0]} />
            <meshStandardMaterial
              color={node.accent}
              emissive={node.accent}
              emissiveIntensity={active ? 1.9 : 0.7}
              roughness={0.3}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      <pointLight intensity={active ? 16 : 6} color="#8fd8ff" distance={16} decay={2} />
    </group>
  )
}

/* ─── EXPERIENCE ──────────────────────────────────────────────── */

/** One pillar per mission, lit by status rather than by proximity alone. */
export function MissionPillars() {
  const { nearZone } = useWorld()
  const active = nearZone === 'experience'
  const zone = getZone('experience')

  const statusColor = { completed: '#7dffb0', current: '#ffd36e', ongoing: '#ff9bd2' } as const

  return (
    <group position={zone.position.toArray()} rotation={[0, zone.rotation, 0]}>
      {missions.map((mission, i) => {
        const x = (i - (missions.length - 1) / 2) * 2.6
        const height = 2.4 + i * 0.75
        return (
          <group key={mission.id} position={[x, 0, 0]}>
            <mesh position={[0, height / 2 + 0.3, 0]} castShadow>
              <boxGeometry args={[1.05, height, 1.05]} />
              <meshStandardMaterial color="#191e28" roughness={0.5} metalness={0.85} />
            </mesh>
            <mesh position={[0, height + 0.36, 0]}>
              <boxGeometry args={[1.12, 0.08, 1.12]} />
              <meshBasicMaterial
                color={statusColor[mission.status]}
                toneMapped={false}
                transparent
                opacity={active ? 0.95 : 0.4}
              />
            </mesh>
            {/* Vertical hairline up the front face. */}
            <mesh position={[0, height / 2 + 0.3, 0.54]}>
              <planeGeometry args={[0.06, height - 0.5]} />
              <meshBasicMaterial
                color={statusColor[mission.status]}
                toneMapped={false}
                transparent
                opacity={active ? 0.75 : 0.25}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/* ─── PROCESS ─────────────────────────────────────────────────── */

/** Six posts in a ring, lit in sequence — idea travelling to production. */
export function ProcessRing() {
  const { nearZone, reducedMotion } = useWorld()
  const active = nearZone === 'process'
  const zone = getZone('process')
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.children.forEach((child, i) => {
      const marker = child.getObjectByName('marker') as THREE.Mesh | undefined
      if (!marker) return
      const material = marker.material as THREE.MeshBasicMaterial
      if (reducedMotion) {
        material.opacity = active ? 0.8 : 0.3
        return
      }
      /* A travelling highlight rather than six independent blinks. */
      const phase = (t * 0.55 - i * 0.16) % 1
      const lit = Math.max(0, 1 - Math.abs(phase - 0.5) * 4)
      material.opacity = (active ? 0.35 : 0.14) + lit * (active ? 0.65 : 0.25)
    })
  })

  return (
    <group ref={group} position={zone.position.toArray()}>
      {processSteps.map((step, i) => {
        const angle = (i / processSteps.length) * Math.PI * 2
        const r = 3.6
        return (
          <group key={step.n} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}>
            <mesh position={[0, 1.1, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.3, 2.2, 8]} />
              <meshStandardMaterial color="#1a1f2a" roughness={0.5} metalness={0.85} />
            </mesh>
            <mesh name="marker" position={[0, 2.35, 0]}>
              <octahedronGeometry args={[0.3, 0]} />
              <meshBasicMaterial color="#c4a4ff" toneMapped={false} transparent opacity={0.3} />
            </mesh>
          </group>
        )
      })}
      <pointLight position={[0, 2.4, 0]} intensity={active ? 12 : 4} color="#c4a4ff" distance={14} decay={2} />
    </group>
  )
}

/* ─── LAB ─────────────────────────────────────────────────────── */

/** A sealed module. Honest about being unfinished rather than faked full. */
export function LabModule() {
  const { nearZone } = useWorld()
  const active = nearZone === 'lab'
  const zone = getZone('lab')
  const caption = useProceduralTexture(
    () => createCaption([lab.title, lab.status], '#8f9bb8', [44, 22]),
    [],
  )

  return (
    <group position={zone.position.toArray()} rotation={[0, zone.rotation, 0]}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[3.4, 3, 2.2]} />
        <meshStandardMaterial color="#171c25" roughness={0.55} metalness={0.8} />
      </mesh>
      {/* Sealed hatch */}
      <mesh position={[0, 1.5, 1.12]}>
        <circleGeometry args={[0.9, 24]} />
        <meshStandardMaterial color="#0e121a" roughness={0.4} metalness={0.9} />
      </mesh>
      <mesh position={[0, 1.5, 1.13]}>
        <ringGeometry args={[0.86, 0.94, 24]} />
        <meshBasicMaterial color="#8f9bb8" toneMapped={false} transparent opacity={active ? 0.7 : 0.3} />
      </mesh>
      <mesh position={[0, 3.8, 0]}>
        <planeGeometry args={[4.2, 2.1]} />
        <meshBasicMaterial
          map={caption}
          transparent
          depthWrite={false}
          toneMapped={false}
          opacity={active ? 1 : 0.55}
        />
      </mesh>
    </group>
  )
}

/* ─── CONTACT ─────────────────────────────────────────────────── */

/** The uplink: a dish that tracks slowly, and the last stop on the ring. */
export function ContactUplink() {
  const { nearZone, reducedMotion } = useWorld()
  const active = nearZone === 'contact'
  const zone = getZone('contact')
  const dish = useRef<THREE.Group>(null)
  const wave = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (dish.current && !reducedMotion) {
      dish.current.rotation.y = Math.sin(t * 0.18) * 0.5
      dish.current.rotation.x = -0.55 + Math.sin(t * 0.13) * 0.1
    }
    if (wave.current) {
      const material = wave.current.material as THREE.MeshBasicMaterial
      if (reducedMotion) {
        material.opacity = active ? 0.25 : 0.1
        return
      }
      const phase = (t * 0.5) % 1
      wave.current.scale.setScalar(0.5 + phase * 2.4)
      material.opacity = (1 - phase) * (active ? 0.5 : 0.18)
      wave.current.rotation.z += delta * 0.2
    }
  })

  return (
    <group position={zone.position.toArray()} rotation={[0, zone.rotation, 0]}>
      {/* Mast */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.42, 4.4, 12]} />
        <meshStandardMaterial color="#1b212b" roughness={0.5} metalness={0.88} />
      </mesh>

      <group ref={dish} position={[0, 4.6, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[1.9, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
          <meshStandardMaterial
            color="#2a323f"
            roughness={0.35}
            metalness={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.17, 12, 12]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <mesh ref={wave} position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.02, 40]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      <pointLight position={[0, 5, 0]} intensity={active ? 20 : 7} color="#dceaff" distance={20} decay={2} />
    </group>
  )
}

/* ─── ABOUT ───────────────────────────────────────────────────── */

/** A slowly turning monogram core over the identity pad. */
export function AboutCore() {
  const { nearZone, reducedMotion } = useWorld()
  const active = nearZone === 'about'
  const zone = getZone('about')
  const shell = useRef<THREE.Mesh>(null)
  const core = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (!reducedMotion) {
      if (shell.current) {
        shell.current.rotation.y += delta * 0.22
        shell.current.rotation.x += delta * 0.09
      }
      if (core.current) core.current.position.y = 3.4 + Math.sin(t * 1.1) * 0.14
    }
    if (core.current) {
      const material = core.current.material as THREE.MeshStandardMaterial
      const wanted = active ? 2.6 : 1.1
      material.emissiveIntensity += (wanted - material.emissiveIntensity) * Math.min(delta, 0.1) * 5
    }
  })

  return (
    <group position={zone.position.toArray()}>
      <mesh ref={core} position={[0, 3.4, 0]}>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial
          color="#bfe6ff"
          emissive="#5ad1ff"
          emissiveIntensity={1.1}
          roughness={0.2}
          metalness={0.4}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={shell} position={[0, 3.4, 0]}>
        <icosahedronGeometry args={[1.9, 0]} />
        <meshBasicMaterial
          color="#5ad1ff"
          wireframe
          transparent
          opacity={active ? 0.4 : 0.16}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, 3.4, 0]} intensity={active ? 18 : 7} color="#5ad1ff" distance={16} decay={2} />
    </group>
  )
}
