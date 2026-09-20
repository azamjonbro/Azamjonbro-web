import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SPAWN, zones } from '@/data/zones'
import { HOME, getPlanet, nextDestination } from '@/data/planets'
import { projects } from '@/data/projects'
import { PROJECT_BAY, projectSlotPosition } from '@/lib/bay'
import { clamp, damp, input } from '@/lib/input'
import { journey, resetJourney } from '@/lib/journey'
import { uiSounds } from '@/lib/uiSounds'
import { blendPose, createIdleDirector, neutralPose, resetPose } from '@/lib/avatarPose'
import { useWorld } from '@/state/WorldContext'
import { Avatar, applyPose, useAvatarRig } from './Avatar'

/** Metres per second at full stick. */
const SPEED = 11
/** How fast the avatar turns to face where it is going. */
const TURN_RATE = 9
/** Push off the surface, m/s. Gravity is per-world, so the arc is too. */
const JUMP = 11.5
/** The single mid-air thruster kick. Weaker, so it extends rather than doubles. */
const BOOST = 8.5
/** Grace period after walking off an edge in which a jump still counts. */
const COYOTE = 0.12
/** A jump pressed this long before landing still fires on touchdown. */
const BUFFER = 0.16
/** How long the avatar climbs away from a world before the next one appears. */
const LAUNCH_SECONDS = 1.7
/** Where the fall onto the next world starts. */
const DROP_HEIGHT = 34

/**
 * The avatar, and the only thing in the scene that owns a position the rest
 * of the world reads.
 *
 * Movement is integrated here and written into a shared vector rather than
 * into React state — the camera, the proximity checks and the HUD all need
 * it every frame, and a state update per frame would re-render the tree
 * sixty times a second.
 *
 * The pose is a separate concern from the position: walking, idling, flying
 * and landing each describe how the figure should be standing, and they are
 * blended in that order of priority before anything is written to a joint.
 * See `lib/avatarPose`.
 */
export const playerPosition = /* @__PURE__ */ new THREE.Vector3(...SPAWN)
export const playerFacing = { angle: 0 }

export function Player({ cameraYaw }: { cameraYaw: React.RefObject<number> }) {
  const {
    blocked, reducedMotion, planet, leaveOrbit, landOn, settle,
    setNearZone, setNearProject, retireHint, hintSeen,
  } = useWorld()

  const group = useRef<THREE.Group>(null)
  const shadow = useRef<THREE.Mesh>(null)
  const rig = useAvatarRig()

  const velocity = useMemo(() => new THREE.Vector3(), [])
  const desired = useMemo(() => new THREE.Vector3(), [])
  const outward = useMemo(() => new THREE.Vector3(), [])
  /* Zone centres as vectors, built once — the data module keeps them as
     plain tuples so it can stay out of the three.js bundle. */
  const zoneCentres = useMemo(
    () => zones.map((zone) => ({ id: zone.id, centre: new THREE.Vector3(...zone.position), radius: zone.radius })),
    [],
  )

  /* Everything the integrator needs to remember between frames, in one
     object so a new piece of state does not mean a new ref. */
  const motion = useMemo(
    () => ({
      vy: 0,
      grounded: true,
      /** Seconds since the feet last touched down, for coyote time. */
      sinceGround: 0,
      /** Seconds left on a buffered jump press. */
      buffer: -1,
      /** The mid-air boost is spent until the next touchdown. */
      boosted: false,
      /** Seconds left of the landing compression, and how hard it was. */
      land: 0,
      impact: 0,
      /** Tumble angle while climbing away from a world. */
      spin: 0,
      air: 0,
    }),
    [],
  )

  const stride = useRef(0)
  const pose = useMemo(neutralPose, [])
  const airPose = useMemo(neutralPose, [])
  const idle = useMemo(createIdleDirector, [])

  /* Proximity is compared against the last reported value so the context is
     only touched when the answer actually changes. */
  const reportedZone = useRef<string | null>(null)
  const reportedProject = useRef<string | null>(null)

  /* A trip is per-mount state, and the module holding it outlives the canvas.
     Somebody who opens an article mid-flight and comes back should be
     standing on something, not still falling through a scene that has been
     rebuilt underneath them. */
  useEffect(() => {
    resetJourney()
    settle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    if (!group.current) return

    const world = getPlanet(planet)
    const p = group.current.position

    /* ── JUMP INPUT ───────────────────────────────────────────── */
    /* The latch is always drained, even when a panel owns the keyboard, so
       a press made under an overlay cannot fire when it closes. */
    if (input.jump) {
      input.jump = false
      if (!blocked && journey.phase === 'grounded') motion.buffer = BUFFER
    }
    motion.buffer -= dt
    motion.sinceGround = motion.grounded ? 0 : motion.sinceGround + dt

    if (motion.buffer > 0 && journey.phase === 'grounded') {
      if (motion.sinceGround < COYOTE) {
        motion.vy = JUMP
        motion.grounded = false
        /* Spend the coyote window, or one press would jump twice. */
        motion.sinceGround = COYOTE
        motion.boosted = false
        motion.buffer = -1
        uiSounds.jump()
        if (!hintSeen) retireHint()
      } else if (!motion.boosted) {
        motion.vy = BOOST
        motion.boosted = true
        motion.buffer = -1
        uiSounds.boost()
      }
    }

    /* ── MOVEMENT ─────────────────────────────────────────────── */
    if (journey.phase === 'launch') {
      /* Off the edge and climbing. The world lets go rather than the avatar
         being thrown: outward drift plus a pull that beats the local
         gravity, which is what makes it read as an escape and not a fall. */
      journey.t += dt
      outward.set(p.x, 0, p.z)
      if (outward.lengthSq() > 0.0001) outward.normalize()
      velocity.addScaledVector(outward, 7 * dt)
      motion.vy += 7.5 * dt
      motion.spin += dt * 2.4

      p.addScaledVector(velocity, dt)
      p.y += motion.vy * dt

      if (journey.t >= LAUNCH_SECONDS) {
        const destination = nextDestination(planet)
        landOn(destination)
        journey.phase = 'fall'
        journey.t = 0
        p.set(0, DROP_HEIGHT, Math.min(9, getPlanet(destination).radius * 0.22))
        velocity.set(0, 0, 0)
        motion.vy = -3
        motion.spin = 0
        /* No boost on the way down: the arrival is a landing, not a flight. */
        motion.boosted = true
        group.current.rotation.y = Math.PI
      }
    } else {
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

      /* Damped rather than snapped, so starting and stopping have weight —
         and damped harder on the ground than in the air, because a jump you
         can steer freely has no commitment in it. */
      velocity.lerp(desired, damp(motion.grounded ? 9 : 3, dt))
      p.addScaledVector(velocity, dt)

      /* ── GRAVITY ────────────────────────────────────────────── */
      motion.vy -= world.gravity * dt
      p.y += motion.vy * dt

      if (p.y <= 0) {
        p.y = 0
        if (!motion.grounded) {
          motion.impact = clamp(-motion.vy / 16, 0.25, 1)
          motion.land = 0.3
          if (journey.phase === 'fall') {
            journey.phase = 'grounded'
            journey.t = 0
            settle()
          }
          if (motion.impact > 0.3) uiSounds.land()
        }
        motion.vy = 0
        motion.grounded = true
        motion.boosted = false
      } else {
        motion.grounded = false
      }
    }

    /* ── THE EDGE ─────────────────────────────────────────────── */
    const distance = Math.hypot(p.x, p.z)
    const limit = world.radius - 1.6

    if (journey.phase === 'grounded' && distance > limit) {
      if (p.y > world.rim) {
        /* Over the rail and still climbing: this world is done with you. */
        journey.phase = 'launch'
        journey.t = 0
        motion.grounded = false
        leaveOrbit()
      } else {
        /* Slide along the rim instead of stopping dead against it. */
        const k = limit / distance
        p.x *= k
        p.z *= k
        velocity.multiplyScalar(0.45)
      }
    }

    playerPosition.copy(p)

    /* How far the camera should stand off. Ramped rather than switched, so
       the whole trip is one move. */
    const detach = journey.phase === 'launch' ? 1 : journey.phase === 'fall' ? 0.5 : 0
    journey.detach += (detach - journey.detach) * damp(1.6, dt)

    /* ── FACING ───────────────────────────────────────────────── */
    if (journey.phase === 'launch') {
      group.current.rotation.y += dt * 1.6
    } else {
      const speed = velocity.length()
      if (speed > 0.35) {
        const target = Math.atan2(velocity.x, velocity.z)
        let diff = target - group.current.rotation.y
        /* Take the short way round, so crossing ±π does not spin the avatar. */
        diff = Math.atan2(Math.sin(diff), Math.cos(diff))
        group.current.rotation.y += diff * damp(TURN_RATE, dt)
      }
    }
    playerFacing.angle = group.current.rotation.y

    /* ── POSE ─────────────────────────────────────────────────── */
    const t = state.clock.elapsedTime
    const ground = Math.hypot(velocity.x, velocity.z)
    const gait = Math.min(1, ground / SPEED)

    resetPose(pose)

    if (!reducedMotion) {
      /* Walk. */
      stride.current += dt * (2.2 + gait * 9)
      const swing = Math.sin(stride.current) * gait * 0.62
      pose.legLPitch = swing
      pose.legRPitch = -swing
      pose.armLPitch = -swing * 0.75
      pose.armRPitch = swing * 0.75
      /* Idle breath, a bob synced to the stride, and a lean into travel. */
      pose.bodyY = Math.sin(t * 1.6) * 0.03 + Math.abs(Math.sin(stride.current)) * gait * 0.09
      pose.bodyPitch = gait * 0.13
      pose.thrust = gait * 0.55 + Math.sin(t * 14) * 0.05 * gait

      /* Idle. Only while genuinely doing nothing — a routine that starts
         while the player is mid-input is a routine that fights them. */
      const calm =
        motion.grounded && journey.phase === 'grounded' && !blocked && gait < 0.04
      blendPose(pose, idle.pose, idle.update(dt, calm))

      /* Air. Outranks both: whatever the legs were doing, they are tucked. */
      motion.air += ((motion.grounded ? 0 : 1) - motion.air) * damp(11, dt)
      if (motion.air > 0.002) {
        resetPose(airPose)
        const rise = clamp(motion.vy / JUMP, -1, 1)
        airPose.legLPitch = -0.9 + rise * 0.3
        airPose.legRPitch = -0.4 - rise * 0.2
        airPose.armLPitch = -1.1 - rise * 0.55
        airPose.armRPitch = -1.1 - rise * 0.55
        airPose.armLRoll = -0.45
        airPose.armRRoll = 0.45
        airPose.bodyPitch = -rise * 0.24
        airPose.bodyY = 0.06
        airPose.thrust = clamp(0.4 + rise * 0.6, 0.3, 1)

        if (journey.phase !== 'grounded') {
          /* Tumbling out of orbit, arms and thruster wide open. */
          airPose.bodyPitch = Math.sin(motion.spin) * 0.55
          airPose.bodyRoll = Math.cos(motion.spin * 0.8) * 0.4
          airPose.legLPitch = -0.55
          airPose.legRPitch = -0.3
          airPose.thrust = 1
        }
        blendPose(pose, airPose, motion.air)
      }

      /* Landing. Applied on top rather than blended, because a compression
         is a modification of whatever pose you land in. */
      if (motion.land > 0) {
        motion.land -= dt
        const k = clamp(motion.land / 0.3, 0, 1) * motion.impact
        pose.squash -= 0.24 * k
        pose.bodyY -= 0.2 * k
        pose.legLPitch -= 0.4 * k
        pose.legRPitch -= 0.4 * k
        pose.armLPitch += 0.45 * k
        pose.armRPitch += 0.45 * k
      }
    }

    applyPose(rig, pose)

    /* The painted shadow belongs to the ground, not to the avatar: it stays
       on the deck as the figure rises, and shrinks away beneath it. */
    if (shadow.current) {
      const fade = clamp(1 - p.y / 8, 0, 1)
      shadow.current.position.y = 0.06 - p.y
      shadow.current.scale.setScalar(0.5 + fade * 0.5)
      ;(shadow.current.material as THREE.MeshBasicMaterial).opacity = 0.36 * fade * fade
    }

    /* ── PROXIMITY ────────────────────────────────────────────── */
    /* Only the station has destinations on it, and only somebody standing
       on it can be near one. */
    let zoneHit: string | null = null
    let projectHit: string | null = null

    if (planet === HOME && journey.phase === 'grounded') {
      for (const zone of zoneCentres) {
        if (p.distanceTo(zone.centre) < zone.radius) {
          zoneHit = zone.id
          break
        }
      }

      /* Exhibits are only live once the player is actually inside the bay. */
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
    }

    if (zoneHit !== reportedZone.current) {
      reportedZone.current = zoneHit
      setNearZone(zoneHit as never)
    }
    if (projectHit !== reportedProject.current) {
      reportedProject.current = projectHit
      setNearProject(projectHit)
    }
  })

  return (
    <group ref={group} position={SPAWN}>
      <Avatar rig={rig} />
      {/*
        A painted contact shadow.

        A real shadow map from the hub's point light would be the correct
        answer and costs a full render pass for one small blob; this reads
        the same from every angle the camera can reach.
      */}
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <circleGeometry args={[0.62, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.36} depthWrite={false} />
      </mesh>
    </group>
  )
}
