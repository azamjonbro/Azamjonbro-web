import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CAMERA, computerCameraPosition } from '@/lib/layout'
import { clamp, damp, pointer } from '@/lib/pointer'
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

export function CameraRig() {
  const { camera } = useThree()
  const events = useThree((s) => s.events)
  const { view, reducedMotion, layout, dragging } = useRoom()

  const basis = useMemo(() => new THREE.Matrix4(), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const offset = useMemo(() => new THREE.Vector3(), [])
  const right = useMemo(() => new THREE.Vector3(), [])
  const targetPos = useMemo(() => new THREE.Vector3(), [])
  const targetQuat = useMemo(() => new THREE.Quaternion(), [])
  const offsetQuat = useMemo(() => new THREE.Quaternion(), [])
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), [])

  /** Recomputed when the monitor is moved, so the seated view follows it. */
  const seated = useMemo(() => computerCameraPosition(layout.monitor), [layout.monitor])

  const fov = useRef<number>(CAMERA.room.fov)
  const lastPos = useMemo(() => new THREE.Vector3(), [])
  const lastQuat = useMemo(() => new THREE.Quaternion(), [])
  /** Smoothed pointer, so a flicked mouse never snaps the camera. */
  const look = useRef({ x: 0, y: 0 })

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const inComputer = view === 'computer'

    /* Mouse look is muted at the machine and off entirely for visitors
       who asked for reduced motion. */
    const scale = reducedMotion || dragging ? 0 : inComputer ? 0.12 : 1
    const t = damp(reducedMotion ? 8 : 2.6, dt)

    look.current.x = THREE.MathUtils.lerp(look.current.x, pointer.nx, damp(4, dt))
    look.current.y = THREE.MathUtils.lerp(look.current.y, pointer.ny, damp(4, dt))

    const yaw = clamp(-look.current.x, -1, 1) * YAW_LIMIT * scale
    const pitch = clamp(-look.current.y, -1, 1) * PITCH_LIMIT * scale

    if (inComputer) {
      targetPos.copy(seated.eye)
      basis.lookAt(targetPos, seated.centre, up)
    } else {
      /* Orbit the anchor point rather than pivoting in place. */
      offset.copy(CAMERA.room.position).sub(CAMERA.room.target)
      offset.applyAxisAngle(up, yaw)

      right.crossVectors(offset, up).normalize()
      offset.applyAxisAngle(right, pitch)

      targetPos.copy(CAMERA.room.target).add(offset)
      basis.lookAt(targetPos, CAMERA.room.target, up)
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

    const wantedFov = inComputer ? CAMERA.computer.fov : CAMERA.room.fov

    if (Math.abs(fov.current - wantedFov) > 0.01) {
      fov.current = THREE.MathUtils.lerp(fov.current, wantedFov, t)
      const cam = camera as THREE.PerspectiveCamera
      cam.fov = fov.current
      cam.updateProjectionMatrix()
    }
  })

  return null
}
