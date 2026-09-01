import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { STATION_RADIUS, SPAWN, zones } from '@/data/zones'
import { projects } from '@/data/projects'
import { PROJECT_BAY, projectSlotPosition } from '@/lib/bay'
import { damp, input } from '@/lib/input'
import { useWorld } from '@/state/WorldContext'

/** Metres per second at full stick. */
const SPEED = 11
/** How fast the avatar turns to face where it is going. */
const TURN_RATE = 9

/**
 * The avatar, and the only thing in the scene that owns a position the rest
 * of the world reads.
 *
 * Movement is integrated here and written into a shared vector rather than
 * into React state — the camera, the proximity checks and the HUD all need
 * it every frame, and a state update per frame would re-render the tree
 * sixty times a second.
 */
export const playerPosition = /* @__PURE__ */ new THREE.Vector3(...SPAWN)
export const playerFacing = { angle: 0 }

export function Player({ cameraYaw }: { cameraYaw: React.RefObject<number> }) {
  const { blocked, reducedMotion, setNearZone, setNearProject, retireHint, hintSeen } = useWorld()

  const group = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const legL = useRef<THREE.Group>(null)
  const legR = useRef<THREE.Group>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const thruster = useRef<THREE.Mesh>(null)

  const velocity = useMemo(() => new THREE.Vector3(), [])
  /* Zone centres as vectors, built once — the data module keeps them as
     plain tuples so it can stay out of the three.js bundle. */
  const zoneCentres = useMemo(
    () => zones.map((zone) => ({ id: zone.id, centre: new THREE.Vector3(...zone.position), radius: zone.radius })),
    [],
  )
  const desired = useMemo(() => new THREE.Vector3(), [])
  const stride = useRef(0)
  /* Proximity is compared against the last reported value so the context is
     only touched when the answer actually changes. */
  const reportedZone = useRef<string | null>(null)
  const reportedProject = useRef<string | null>(null)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    if (!group.current) return

    /* ── MOVEMENT ─────────────────────────────────────────────── */
    const yaw = cameraYaw.current ?? 0
    desired.set(0, 0, 0)

    if (!blocked && (input.moveX !== 0 || input.moveZ !== 0)) {
      /* Input is camera-relative: pushing forward means away from the
         camera, whichever way it happens to be pointing. */
      const sin = Math.sin(yaw)
      const cos = Math.cos(yaw)
      desired.set(
        input.moveX * cos - input.moveZ * sin,
        0,
        input.moveX * sin + input.moveZ * cos,
      )
      desired.normalize().multiplyScalar(SPEED)
      if (!hintSeen) retireHint()
    }

    /* Damped rather than snapped, so starting and stopping have weight. */
    velocity.lerp(desired, damp(9, dt))
    group.current.position.addScaledVector(velocity, dt)

    /* ── BOUNDS ───────────────────────────────────────────────── */
    const p = group.current.position
    p.y = 0

    const distance = Math.hypot(p.x, p.z)
    const limit = STATION_RADIUS - 1.6
    if (distance > limit) {
      /* Slide along the rim instead of stopping dead against it. */
      p.multiplyScalar(limit / distance)
      velocity.multiplyScalar(0.45)
    }

    playerPosition.copy(p)

    /* ── FACING ───────────────────────────────────────────────── */
    const speed = velocity.length()
    if (speed > 0.35) {
      const target = Math.atan2(velocity.x, velocity.z)
      let diff = target - group.current.rotation.y
      /* Take the short way round, so crossing ±π does not spin the avatar. */
      diff = Math.atan2(Math.sin(diff), Math.cos(diff))
      group.current.rotation.y += diff * damp(TURN_RATE, dt)
    }
    playerFacing.angle = group.current.rotation.y

    /* ── ANIMATION ────────────────────────────────────────────── */
    const t = state.clock.elapsedTime
    const gait = Math.min(1, speed / SPEED)

    if (!reducedMotion) {
      stride.current += dt * (2.2 + gait * 9)
      const swing = Math.sin(stride.current) * gait * 0.62

      if (legL.current) legL.current.rotation.x = swing
      if (legR.current) legR.current.rotation.x = -swing
      if (armL.current) armL.current.rotation.x = -swing * 0.75
      if (armR.current) armR.current.rotation.x = swing * 0.75

      if (body.current) {
        /* Idle breath, a bob synced to the stride, and a lean into travel. */
        body.current.position.y =
          Math.sin(t * 1.6) * 0.03 + Math.abs(Math.sin(stride.current)) * gait * 0.09
        body.current.rotation.x = gait * 0.13
      }
      if (thruster.current) {
        const material = thruster.current.material as THREE.MeshBasicMaterial
        material.opacity = 0.18 + gait * 0.5 + Math.sin(t * 14) * 0.04 * gait
      }
    }

    /* ── PROXIMITY ────────────────────────────────────────────── */
    let zoneHit: string | null = null
    for (const zone of zoneCentres) {
      if (p.distanceTo(zone.centre) < zone.radius) {
        zoneHit = zone.id
        break
      }
    }
    if (zoneHit !== reportedZone.current) {
      reportedZone.current = zoneHit
      setNearZone(zoneHit as never)
    }

    /* Exhibits are only live once the player is actually inside the bay. */
    let projectHit: string | null = null
    if (zoneHit === 'projects') {
      let best: number = PROJECT_BAY.slotRadius
      for (let i = 0; i < projects.length; i++) {
        const slot = projectSlotPosition(i)
        const d = p.distanceTo(slot)
        if (d < best) {
          best = d
          projectHit = projects[i].id
        }
      }
    }
    if (projectHit !== reportedProject.current) {
      reportedProject.current = projectHit
      setNearProject(projectHit)
    }
  })

  return (
    <group ref={group} position={SPAWN}>
      <Avatar
        body={body}
        legL={legL}
        legR={legR}
        armL={armL}
        armR={armR}
        thruster={thruster}
      />
      <PlayerShadow />
    </group>
  )
}

/* ─── THE AVATAR ──────────────────────────────────────────────── */

const SUIT = '#2c3444'
const SUIT_LIGHT = '#465468'
const TRIM = '#5ad1ff'

/**
 * Built from primitives rather than loaded from a model.
 *
 * A downloaded character would be the single largest asset on the site and
 * would still need rigging to animate; a jointed figure of nine boxes reads
 * correctly at the distance the camera actually holds, costs nothing, and
 * can be posed directly from the movement code above.
 */
function Avatar({
  body,
  legL,
  legR,
  armL,
  armR,
  thruster,
}: {
  body: React.RefObject<THREE.Group | null>
  legL: React.RefObject<THREE.Group | null>
  legR: React.RefObject<THREE.Group | null>
  armL: React.RefObject<THREE.Group | null>
  armR: React.RefObject<THREE.Group | null>
  thruster: React.RefObject<THREE.Mesh | null>
}) {
  return (
    <group ref={body} position={[0, 0, 0]}>
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

      {/* Helmet and visor */}
      <mesh position={[0, 1.92, 0]} castShadow>
        <sphereGeometry args={[0.29, 24, 20]} />
        <meshStandardMaterial color={SUIT_LIGHT} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 1.9, 0.15]} rotation={[-0.12, 0, 0]}>
        <sphereGeometry args={[0.245, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
        <meshStandardMaterial
          color="#08131c"
          emissive={TRIM}
          emissiveIntensity={0.5}
          roughness={0.08}
          metalness={0.95}
        />
      </mesh>

      {/* Backpack, and the thruster glow under it */}
      <mesh position={[0, 1.34, -0.3]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.18]} />
        <meshStandardMaterial color="#1d232e" roughness={0.6} metalness={0.6} />
      </mesh>
      <mesh ref={thruster} position={[0, 1.06, -0.34]} rotation={[Math.PI / 2, 0, 0]}>
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

      {/* Arms — pivoted at the shoulder so rotation reads as a swing. */}
      <group ref={armL} position={[-0.42, 1.52, 0]}>
        <mesh position={[0, -0.32, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.42, 4, 10]} />
          <meshStandardMaterial color={SUIT_LIGHT} roughness={0.5} metalness={0.55} />
        </mesh>
      </group>
      <group ref={armR} position={[0.42, 1.52, 0]}>
        <mesh position={[0, -0.32, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.42, 4, 10]} />
          <meshStandardMaterial color={SUIT_LIGHT} roughness={0.5} metalness={0.55} />
        </mesh>
      </group>

      {/* Legs — pivoted at the hip for the same reason. */}
      <group ref={legL} position={[-0.16, 0.88, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.5, 4, 10]} />
          <meshStandardMaterial color={SUIT} roughness={0.55} metalness={0.5} />
        </mesh>
      </group>
      <group ref={legR} position={[0.16, 0.88, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.5, 4, 10]} />
          <meshStandardMaterial color={SUIT} roughness={0.55} metalness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * A painted contact shadow.
 *
 * A real shadow map from the hub's point light would be the correct answer
 * and costs a full render pass for one small blob; this reads the same from
 * every angle the camera can reach.
 */
function PlayerShadow() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
      <circleGeometry args={[0.62, 24]} />
      <meshBasicMaterial color="#000000" transparent opacity={0.36} depthWrite={false} />
    </mesh>
  )
}
