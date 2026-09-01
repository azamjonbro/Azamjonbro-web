import { Suspense, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { projects, type Project } from '@/data/projects'
import { projectSlotPosition, projectSlotRotation } from '@/lib/bay'
import { useProceduralTexture } from '@/hooks/useTexture'
import { createExhibitPlate, createHoloSurface } from '@/lib/spaceTextures'
import { useWorld } from '@/state/WorldContext'

/**
 * The seven exhibits, standing on an arc.
 *
 * Each one is dark until the player walks into its slot, at which point the
 * screenshot fades up and the plate lights. Nothing in this bay is bright at
 * rest — the bay is meant to reward walking through it, not to shout across
 * the station.
 */
export function ProjectBay() {
  return (
    <group>
      {projects.map((project, index) => (
        <Exhibit key={project.id} project={project} index={index} />
      ))}
    </group>
  )
}

function Exhibit({ project, index }: { project: Project; index: number }) {
  const { nearProject, openProject, reducedMotion } = useWorld()
  const active = nearProject === project.id
  const focused = openProject === project.id

  const position = projectSlotPosition(index)
  const rotation = projectSlotRotation(index)

  const plate = useProceduralTexture(
    () =>
      createExhibitPlate(
        project.index,
        project.name,
        project.category,
        project.technologies,
        project.accent,
      ),
    [project.id],
  )
  const holo = useProceduralTexture(
    () => createHoloSurface(256, 256, project.accent),
    [project.accent],
  )

  const group = useRef<THREE.Group>(null)
  const screen = useRef<THREE.Group>(null)
  const light = useRef<THREE.PointLight>(null)
  const beam = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const t = state.clock.elapsedTime
    const wanted = focused ? 1 : active ? 0.85 : 0.14

    if (screen.current) {
      /* One driver for the whole exhibit: opacity, lift and light all read
         from the same eased value, so nothing can get out of step. */
      screen.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh
        const material = mesh.material as THREE.Material & { opacity: number }
        if (material && 'opacity' in material) {
          material.opacity += (wanted * (mesh.userData.max ?? 1) - material.opacity) * dt * 5
        }
      })
      if (!reducedMotion) {
        screen.current.position.y = 3.5 + Math.sin(t * 0.8 + index) * 0.09
      }
    }

    if (light.current) {
      light.current.intensity += (wanted * 22 - light.current.intensity) * dt * 5
    }

    if (beam.current) {
      const material = beam.current.material as THREE.MeshBasicMaterial
      material.opacity += (wanted * 0.16 - material.opacity) * dt * 5
    }

    if (group.current && !reducedMotion) {
      /* A tiny turn toward the viewer when live, so an activated exhibit
         reads as having noticed them. */
      const target = rotation + (active ? 0.06 : 0)
      group.current.rotation.y += (target - group.current.rotation.y) * dt * 3
    }
  })

  return (
    <group ref={group} position={position.toArray()} rotation={[0, rotation, 0]}>
      {/* Base */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.9, 0.4, 6]} />
        <meshStandardMaterial color="#1a1f29" roughness={0.55} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.15, 1.4, 6]} />
        <meshBasicMaterial color={project.accent} toneMapped={false} transparent opacity={0.6} />
      </mesh>

      {/* Emitter column */}
      <mesh position={[0, 1.2, -0.15]} castShadow>
        <boxGeometry args={[0.42, 1.6, 0.34]} />
        <meshStandardMaterial color="#161b24" roughness={0.45} metalness={0.9} />
      </mesh>

      {/* Projection beam from the emitter up into the screen */}
      <mesh ref={beam} position={[0, 2.6, 0]}>
        <coneGeometry args={[2.6, 2.6, 4, 1, true]} />
        <meshBasicMaterial
          color={project.accent}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <pointLight ref={light} position={[0, 3.4, 0.6]} intensity={3} color={project.accent} distance={14} decay={2} />

      {/* Hologram */}
      <group ref={screen} position={[0, 3.5, 0]}>
        <mesh userData={{ max: 0.34 }}>
          <planeGeometry args={[6.2, 4.3]} />
          <meshBasicMaterial
            map={holo}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        <Suspense fallback={null}>
          <Screenshot src={project.image} />
        </Suspense>

        <mesh position={[0, -1.42, 0.02]} userData={{ max: 1 }}>
          <planeGeometry args={[5.8, 2.9]} />
          <meshBasicMaterial
            map={plate}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  )
}

/**
 * The real screenshot, mapped onto the hologram.
 *
 * Loaded through the loader cache so the same file is not decoded twice when
 * the panel opens over the top of it.
 */
function Screenshot({ src }: { src: string }) {
  const texture = useLoader(THREE.TextureLoader, src)
  texture.colorSpace = THREE.SRGBColorSpace

  return (
    <mesh position={[0, 0.72, 0.01]} userData={{ max: 0.92 }}>
      <planeGeometry args={[5.6, 3.5]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
