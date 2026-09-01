import * as THREE from 'three'

/**
 * Single source of truth for the room's geometry.
 * The camera rig, the props and the wall displays all read from here,
 * so nothing can drift out of alignment.
 */
export const ROOM = {
  width: 4.2,
  depth: 3.6,
  height: 2.9,
} as const

export const HALF_W = ROOM.width / 2
export const HALF_D = ROOM.depth / 2

export const DESK = {
  center: [0.25, 0, -1.26] as [number, number, number],
  width: 2.4,
  depth: 0.82,
  /** Height of the marble top surface. */
  top: 0.75,
  thickness: 0.05,
} as const

/**
 * The monitor is placed by its arm base, which is what sits on the desk and
 * what the layout editor drags. The panel hangs off it at a fixed offset.
 */
export const MONITOR = {
  /** Panel centre, relative to the arm base. */
  offset: [-0.02, 0.49, 0.04] as [number, number, number],
  /** Panel tilt relative to the arm. */
  tilt: -0.07,
  screenWidth: 0.84,
  screenHeight: 0.4,
  bezel: 0.012,
} as const

export const WALL_DISPLAYS = {
  x: -1.45,
  z: -HALF_D + 0.04,
  width: 0.66,
  height: 0.38,
  rows: [
    { id: 'swisswatch', y: 2.02 },
    { id: 'hadiya', y: 1.55 },
    { id: 'ctf', y: 1.08 },
  ],
} as const

export const CAMERA = {
  /** Hero framing — matches the reference front view. */
  room: {
    position: new THREE.Vector3(0.2, 1.48, 2.25),
    target: new THREE.Vector3(0.05, 1.22, -1.6),
    fov: 38,
  },
  /** Seated at the machine, screen filling the frame. */
  computer: {
    /** Derived from MONITOR so the two can never disagree. */
    distance: 0.8,
    fov: 40,
  },
} as const

/** Where the panel ends up once the arm base has been placed and turned. */
export function monitorPanelWorld(base: { position: Vec3Tuple; rotation: Vec3Tuple }) {
  const yaw = base.rotation[1]
  const position = new THREE.Vector3(...MONITOR.offset)
    .applyAxisAngle(UP, yaw)
    .add(new THREE.Vector3(...base.position))

  return { position, yaw: yaw + MONITOR.tilt }
}

/** Camera position that frames the monitor screen head-on. */
export function computerCameraPosition(base: { position: Vec3Tuple; rotation: Vec3Tuple }) {
  const { position, yaw } = monitorPanelWorld(base)
  const normal = new THREE.Vector3(0, 0, 1).applyAxisAngle(UP, yaw)
  return {
    eye: position.clone().addScaledVector(normal, CAMERA.computer.distance),
    centre: position,
  }
}

type Vec3Tuple = [number, number, number]
const UP = /* @__PURE__ */ new THREE.Vector3(0, 1, 0)
