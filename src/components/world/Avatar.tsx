import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Pose } from '@/lib/avatarPose'

/**
 * The figure itself, and the only code that touches its transforms.
 *
 * Built from primitives rather than loaded from a model. A downloaded
 * character would be the single largest asset on the site and would still
 * need rigging to animate; a jointed figure of a dozen boxes reads correctly
 * at the distance the camera actually holds, costs nothing, and can be posed
 * directly from the movement code.
 */

const SUIT = '#2c3444'
const SUIT_LIGHT = '#465468'
const TRIM = '#5ad1ff'

export interface AvatarRig {
  body: React.RefObject<THREE.Group | null>
  head: React.RefObject<THREE.Group | null>
  legL: React.RefObject<THREE.Group | null>
  legR: React.RefObject<THREE.Group | null>
  armL: React.RefObject<THREE.Group | null>
  armR: React.RefObject<THREE.Group | null>
  thruster: React.RefObject<THREE.Mesh | null>
  /** The light the thruster throws, brightened with it. */
  flare: React.RefObject<THREE.PointLight | null>
}

export function useAvatarRig(): AvatarRig {
  const body = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const legL = useRef<THREE.Group>(null)
  const legR = useRef<THREE.Group>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const thruster = useRef<THREE.Mesh>(null)
  const flare = useRef<THREE.PointLight>(null)

  return useMemo(
    () => ({ body, head, legL, legR, armL, armR, thruster, flare }),
    [],
  )
}

/** Writes a blended pose onto the rig. The one place transforms are set. */
export function applyPose(rig: AvatarRig, pose: Pose) {
  const { body, head, legL, legR, armL, armR, thruster, flare } = rig

  if (body.current) {
    body.current.position.y = pose.bodyY
    body.current.rotation.set(pose.bodyPitch, pose.bodyYaw, pose.bodyRoll)
    /* Volume is roughly preserved: what leaves the height goes to the width,
       which is the difference between a squash and a shrink. */
    const spread = 1 + (1 - pose.squash) * 0.55
    body.current.scale.set(spread, pose.squash, spread)
  }
  if (head.current) head.current.rotation.set(pose.headPitch, pose.headYaw, pose.headRoll)
  if (armL.current) armL.current.rotation.set(pose.armLPitch, 0, pose.armLRoll)
  if (armR.current) armR.current.rotation.set(pose.armRPitch, 0, pose.armRRoll)
  if (legL.current) legL.current.rotation.x = pose.legLPitch
  if (legR.current) legR.current.rotation.x = pose.legRPitch

  if (thruster.current) {
    const material = thruster.current.material as THREE.MeshBasicMaterial
    material.opacity = 0.16 + pose.thrust * 0.62
    /* The plume lengthens as it brightens; a cone that only changes opacity
       reads as a light being turned up, not as thrust. */
    thruster.current.scale.set(1, 0.7 + pose.thrust * 1.5, 1)
  }
  if (flare.current) flare.current.intensity = pose.thrust * 7
}

export function Avatar({ rig }: { rig: AvatarRig }) {
  return (
    <group ref={rig.body}>
      {/* Torso */}
      <mesh position={[0, 1.28, 0]} castShadow>
        <capsuleGeometry args={[0.32, 0.5, 6, 14]} />
        <meshStandardMaterial color={SUIT} roughness={0.52} metalness={0.55} />
      </mesh>

      {/* Chest plate — the only bright element, kept small on purpose. */}
      <mesh position={[0, 1.36, 0.3]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.07]} />
        <meshStandardMaterial
          color="#0f141d"
          emissive={TRIM}
          emissiveIntensity={0.9}
          roughness={0.35}
          metalness={0.6}
        />
      </mesh>

      {/* Head — pivoted at the neck so a turn reads as a turn. */}
      <group ref={rig.head} position={[0, 1.66, 0]}>
        <mesh position={[0, 0.26, 0]} castShadow>
          <sphereGeometry args={[0.29, 24, 20]} />
          <meshStandardMaterial color={SUIT_LIGHT} roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.24, 0.15]} rotation={[-0.12, 0, 0]}>
          <sphereGeometry args={[0.245, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          <meshStandardMaterial
            color="#08131c"
            emissive={TRIM}
            emissiveIntensity={0.5}
            roughness={0.08}
            metalness={0.95}
          />
        </mesh>
        {/* Lamp on the crown: gives the turn of the head something to carry. */}
        <mesh position={[0, 0.46, 0.1]}>
          <sphereGeometry args={[0.05, 10, 8]} />
          <meshBasicMaterial color={TRIM} toneMapped={false} />
        </mesh>
      </group>

      {/* Backpack, and the thruster under it */}
      <mesh position={[0, 1.34, -0.3]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.18]} />
        <meshStandardMaterial color="#1d232e" roughness={0.6} metalness={0.6} />
      </mesh>
      <mesh ref={rig.thruster} position={[0, 1.06, -0.34]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.11, 0.5, 12, 1, true]} />
        <meshBasicMaterial
          color={TRIM}
          transparent
          opacity={0.2}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <pointLight ref={rig.flare} position={[0, 0.9, -0.4]} intensity={0} color={TRIM} distance={7} decay={2} />

      {/* Arms — pivoted at the shoulder so rotation reads as a swing. */}
      <group ref={rig.armL} position={[-0.42, 1.52, 0]}>
        <mesh position={[0, -0.32, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.42, 4, 10]} />
          <meshStandardMaterial color={SUIT_LIGHT} roughness={0.5} metalness={0.55} />
        </mesh>
      </group>
      <group ref={rig.armR} position={[0.42, 1.52, 0]}>
        <mesh position={[0, -0.32, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.42, 4, 10]} />
          <meshStandardMaterial color={SUIT_LIGHT} roughness={0.5} metalness={0.55} />
        </mesh>
      </group>

      {/* Legs — pivoted at the hip for the same reason. */}
      <group ref={rig.legL} position={[-0.16, 0.88, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.5, 4, 10]} />
          <meshStandardMaterial color={SUIT} roughness={0.55} metalness={0.5} />
        </mesh>
      </group>
      <group ref={rig.legR} position={[0.16, 0.88, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.5, 4, 10]} />
          <meshStandardMaterial color={SUIT} roughness={0.55} metalness={0.5} />
        </mesh>
      </group>
    </group>
  )
}
