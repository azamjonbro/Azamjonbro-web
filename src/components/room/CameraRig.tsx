import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CAMERA, computerCameraPosition, type Shot } from '@/lib/layout'
import { clamp, damp, pointer } from '@/lib/pointer'
import { scroll } from '@/lib/scroll'
import { useRoom } from '@/state/RoomContext'

/**
 * How far the mouse orbits the camera around the workstation, in radians.
 * Orbiting rather than turning the head keeps whatever is under the cursor
 * under the cursor — a head turn makes objects slide away as you reach for them.
 */
const YAW_LIMIT = 0.19
const PITCH_LIMIT = 0.1
/** Extra head tilt on top of the orbit, for a little life. */
const LOOK_LIMIT = 0.035

/** Seconds the opening move takes to settle onto the hero framing. */
const INTRO_DURATION = 2.4

/** Cubic ease-out — fast departure, long settle. Reads as a camera, not a lerp. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

export function CameraRig() {
  const { camera } = useThree()
  const events = useThree((s) => s.events)
  const { view, reducedMotion, layout, dragging, loading } = useRoom()

  const basis = useMemo(() => new THREE.Matrix4(), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const offset = useMemo(() => new THREE.Vector3(), [])
  const right = useMemo(() => new THREE.Vector3(), [])
  const targetPos = useMemo(() => new THREE.Vector3(), [])
  const targetQuat = useMemo(() => new THREE.Quaternion(), [])
  const offsetQuat = useMemo(() => new THREE.Quaternion(), [])
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), [])

  /* Scratch vectors for the scroll blend, allocated once. */
  const shotEye = useMemo(() => new THREE.Vector3(), [])
  const shotAim = useMemo(() => new THREE.Vector3(), [])

  /** Recomputed when the monitor is moved, so the seated view follows it. */
  const seated = useMemo(() => computerCameraPosition(layout.monitor), [layout.monitor])

  const fov = useRef<number>(CAMERA.shots[0].fov)
  const intro = useRef(0)
  const lastPos = useMemo(() => new THREE.Vector3(), [])
  const lastQuat = useMemo(() => new THREE.Quaternion(), [])
  /** Smoothed pointer, so a flicked mouse never snaps the camera. */
  const look = useRef({ x: 0, y: 0 })

  /**
   * Reads the shot list at a fractional position, writing into the scratch
   * vectors. `stage` is continuous, so this is the whole scroll–camera link.
   */
  const sampleShots = (stage: number) => {
    const shots = CAMERA.shots as Shot[]
    const max = shots.length - 1
    const clamped = clamp(stage, 0, max)
    const i = Math.min(Math.floor(clamped), max - 1)
    const f = clamped - i
    const a = shots[i]
    const b = shots[i + 1] ?? a

    shotEye.copy(a.position).lerp(b.position, f)
    shotAim.copy(a.target).lerp(b.target, f)
    return THREE.MathUtils.lerp(a.fov, b.fov, f)
  }

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const inComputer = view === 'computer'

    /* The opening move only runs once the loading screen has let go. */
    if (!loading && intro.current < 1) {
      intro.current = Math.min(1, intro.current + dt / INTRO_DURATION)
    }
    const introT = reducedMotion ? 1 : easeOut(intro.current)

    const stageFov = sampleShots(scroll.stage)

    /* Mouse-look is full strength in the hero, damped once the page has
       scrolled into the reading sections, and muted at the machine. */
    const scrollDamp = THREE.MathUtils.lerp(1, 0.4, clamp(scroll.stage, 0, 1))
    const scale = reducedMotion || dragging ? 0 : inComputer ? 0.12 : scrollDamp
    const t = damp(reducedMotion ? 8 : 2.6, dt)

    look.current.x = THREE.MathUtils.lerp(look.current.x, pointer.nx, damp(4, dt))
    look.current.y = THREE.MathUtils.lerp(look.current.y, pointer.ny, damp(4, dt))

    const yaw = clamp(-look.current.x, -1, 1) * YAW_LIMIT * scale
    const pitch = clamp(-look.current.y, -1, 1) * PITCH_LIMIT * scale

    if (inComputer) {
      targetPos.copy(seated.eye)
      basis.lookAt(targetPos, seated.centre, up)
    } else {
      /* Orbit the shot's aim point rather than pivoting in place. */
      offset.copy(shotEye).sub(shotAim)
      offset.applyAxisAngle(up, yaw)

      right.crossVectors(offset, up).normalize()
      offset.applyAxisAngle(right, pitch)

      /* The entrance pulls straight back along the view ray and releases,
         so the room arrives rather than appearing. */
      if (introT < 1) offset.multiplyScalar(THREE.MathUtils.lerp(1.7, 1, introT))

      targetPos.copy(shotAim).add(offset)
      basis.lookAt(targetPos, shotAim, up)
    }

    targetQuat.setFromRotationMatrix(basis)

    /* A whisper of extra head tilt on top, so it does not feel like a rail. */
    euler.set(pitch * LOOK_LIMIT * 4, yaw * LOOK_LIMIT * 4, 0)
    offsetQuat.setFromEuler(euler)
    targetQuat.multiply(offsetQuat)

    camera.position.lerp(targetPos, t)
    camera.quaternion.slerp(targetQuat, t)

    /* The camera keeps drifting after the pointer stops. Replaying the last
       pointer event keeps hover in sync, so a click never misses what the
       tooltip says is under the cursor. */
    if (
      camera.position.distanceToSquared(lastPos) > 1e-9 ||
      Math.abs(camera.quaternion.dot(lastQuat)) < 0.9999999
    ) {
      lastPos.copy(camera.position)
      lastQuat.copy(camera.quaternion)
      events.update?.()
    }

    const wantedFov = inComputer
      ? CAMERA.computer.fov
      : stageFov + (1 - introT) * 14

    if (Math.abs(fov.current - wantedFov) > 0.01) {
      fov.current = THREE.MathUtils.lerp(fov.current, wantedFov, t)
      const cam = camera as THREE.PerspectiveCamera
      cam.fov = fov.current
      cam.updateProjectionMatrix()
    }
  })

  return null
}
