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
    { id: 'swisswatchpremium', y: 2.02 },
    { id: 'algoritmedu', y: 1.55 },
    { id: 'spring', y: 1.08 },
  ],
} as const

export interface Shot {
  position: THREE.Vector3
  target: THREE.Vector3
  fov: number
}

const shot = (
  position: [number, number, number],
  target: [number, number, number],
  fov: number,
): Shot => ({
  position: new THREE.Vector3(...position),
  target: new THREE.Vector3(...target),
  fov,
})

export const CAMERA = {
  /** Hero framing — the room, head on. */
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
  /**
   * One framing per section, indexed by `navItems[i].shot`.
   *
   * The room has no near wall, so shots past z = HALF_D are looking in
   * from outside; anything inside stays within the side walls at ±HALF_W.
   * Scrolling interpolates between consecutive entries, which is why the
   * list has to read as a continuous camera move rather than a set of cuts.
   */
  shots: [
    /* 0 · home — the hero. Identical to `room`, so entering the page and
       sitting at stage 0 cannot disagree by a pixel. */
    shot([0.2, 1.5, 2.62], [0.05, 1.22, -1.6], 40),
    /* 1 · projects — swing left onto the wall panels. */
    shot([-0.35, 1.66, 1.5], [-1.25, 1.5, -1.72], 42),
    /* 2 · about — in close over the desk from the right. */
    shot([1.15, 1.32, 0.7], [0.2, 1.0, -1.35], 43),
    /* 3 · skills — high, looking down across the whole surface. */
    shot([0.3, 2.3, 1.55], [0.22, 0.86, -1.3], 46),
    /* 4 · experience — low from the window side, along the desk. */
    shot([1.55, 1.12, 0.15], [-0.45, 1.12, -1.62], 40),
    /* 5 · process — just above the keyboard, shallow and tight. */
    shot([0.1, 1.0, 0.3], [0.26, 0.84, -1.28], 36),
    /* 6 · build — back out wide, the room reading as a system. */
    shot([-1.0, 1.8, 1.9], [0.1, 1.18, -1.5], 47),
    /* 7 · contact — pulled all the way back, everything in frame. */
    shot([0.28, 1.6, 2.75], [0.15, 1.2, -1.6], 45),
  ] as Shot[],
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
