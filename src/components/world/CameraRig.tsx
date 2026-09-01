import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getZone } from '@/data/zones'
import { projectSlotPosition } from '@/lib/bay'
import { projects } from '@/data/projects'
import { clamp, damp, input } from '@/lib/input'
import { playerPosition } from './Player'
import { useWorld } from '@/state/WorldContext'

/** Third-person rig geometry. */
const FOLLOW = { distance: 13, height: 5.4, lookHeight: 1.5 }
/** The opening move: high and far, easing down to the follow position. */
const ARRIVAL_SECONDS = 3.4

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * One camera, three jobs: follow the avatar, fly to a destination when a
 * panel opens, and fly back when it closes.
 *
 * There is no cut anywhere. Every change of framing is a damped move toward
 * a target that something else decided, which is what keeps the whole thing
 * feeling like a camera rather than a set of viewpoints.
 */
export function CameraRig({ yawOut }: { yawOut: React.RefObject<number> }) {
  const { camera } = useThree()
  const { stage, openZone, openProject, reducedMotion } = useWorld()

  const eye = useMemo(() => new THREE.Vector3(), [])
  const aim = useMemo(() => new THREE.Vector3(), [])
  const offset = useMemo(() => new THREE.Vector3(), [])
  const smoothedTarget = useMemo(() => new THREE.Vector3().copy(playerPosition), [])

  const arrival = useRef(0)
  const yaw = useRef(0)
  const pitch = useRef(0.28)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)

    /* The arrival move only runs once the visitor has actually entered. */
    if (stage === 'entered' && arrival.current < 1) {
      arrival.current = Math.min(1, arrival.current + dt / ARRIVAL_SECONDS)
    }
    const arrived = reducedMotion ? 1 : easeOutCubic(arrival.current)

    /* Drag sets the orbit; an un-dragged camera drifts a few degrees with
       the pointer so the frame is never completely static. */
    const driftYaw = reducedMotion ? 0 : -input.nx * 0.16
    const driftPitch = reducedMotion ? 0 : input.ny * 0.05

    yaw.current += (input.yaw + driftYaw - yaw.current) * damp(4.5, dt)
    pitch.current += (input.pitch + driftPitch - pitch.current) * damp(4.5, dt)
    pitch.current = clamp(pitch.current, 0.02, 0.78)
    yawOut.current = yaw.current

    /* ── WHAT THE CAMERA IS LOOKING AT ────────────────────────── */
    let focus: THREE.Vector3 | null = null
    let distance = FOLLOW.distance
    let height = FOLLOW.height

    if (openProject) {
      const index = projects.findIndex((p) => p.id === openProject)
      if (index >= 0) {
        focus = projectSlotPosition(index)
        distance = 7.5
        height = 3.6
      }
    } else if (openZone) {
      focus = getZone(openZone).position
      distance = openZone === 'projects' ? 20 : 11
      height = openZone === 'projects' ? 9 : 5
    }

    /* Track the avatar smoothly even while focused elsewhere, so the return
       move lands on where the player is now rather than where they were. */
    smoothedTarget.lerp(focus ?? playerPosition, damp(focus ? 2.6 : 7, dt))

    aim.copy(smoothedTarget)
    aim.y += focus ? 2.6 : FOLLOW.lookHeight

    /* ── WHERE THE CAMERA SITS ────────────────────────────────── */
    const pullBack = 1 + (1 - arrived) * 2.6
    const rise = 1 + (1 - arrived) * 5.2

    offset.set(
      Math.sin(yaw.current) * Math.cos(pitch.current),
      Math.sin(pitch.current) + 0.001,
      Math.cos(yaw.current) * Math.cos(pitch.current),
    )
    offset.multiplyScalar(distance * pullBack)
    offset.y = (height + Math.sin(pitch.current) * distance * 0.4) * rise

    eye.copy(smoothedTarget).add(offset)

    /* Never drop below the deck: a camera under the floor sees the sky
       through the station and instantly breaks the illusion. */
    eye.y = Math.max(eye.y, 1.4)

    const settle = damp(focus ? 2.4 : 4.2, dt)
    camera.position.lerp(eye, settle)

    /* Look-at is interpolated through a quaternion rather than applied
       directly, so a fast change of focus swings instead of snapping. */
    const previous = camera.quaternion.clone()
    camera.lookAt(aim)
    const wanted = camera.quaternion.clone()
    camera.quaternion.copy(previous).slerp(wanted, settle)
  })

  return null
}
