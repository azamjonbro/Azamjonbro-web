/**
 * How the avatar is standing, as fifteen numbers.
 *
 * Walking, idling and flying all want to drive the same nine joints, and
 * three sets of code writing `rotation.x` in sequence is how a character
 * ends up twitching. So each of them fills a pose instead, the poses are
 * blended in order of priority, and exactly one place applies the result.
 *
 * Nothing here imports three.js: it is arithmetic, and keeping it out of the
 * renderer bundle is free.
 */
export interface Pose {
  /** Torso offset from the hips, metres. */
  bodyY: number
  bodyPitch: number
  bodyYaw: number
  bodyRoll: number
  headPitch: number
  headYaw: number
  headRoll: number
  armLPitch: number
  armLRoll: number
  armRPitch: number
  armRRoll: number
  legLPitch: number
  legRPitch: number
  /** Thruster brightness, 0 → 1. */
  thrust: number
  /** Vertical scale. 1 is neutral; below it the figure is compressed. */
  squash: number
}

export function neutralPose(): Pose {
  return {
    bodyY: 0,
    bodyPitch: 0,
    bodyYaw: 0,
    bodyRoll: 0,
    headPitch: 0,
    headYaw: 0,
    headRoll: 0,
    armLPitch: 0,
    armLRoll: 0,
    armRPitch: 0,
    armRRoll: 0,
    legLPitch: 0,
    legRPitch: 0,
    thrust: 0,
    squash: 1,
  }
}

const KEYS = Object.keys(neutralPose()) as (keyof Pose)[]

export function resetPose(pose: Pose) {
  for (const key of KEYS) pose[key] = key === 'squash' ? 1 : 0
}

/** Moves `out` a fraction `k` of the way toward `to`. */
export function blendPose(out: Pose, to: Pose, k: number) {
  if (k <= 0) return
  const t = k >= 1 ? 1 : k
  for (const key of KEYS) out[key] += (to[key] - out[key]) * t
}

/** Rises from 0 to 1 and back over the length of an act, with no corners. */
function arc(u: number) {
  return Math.sin(Math.min(1, Math.max(0, u)) * Math.PI)
}

/** Smooth 0 → 1 over [a, b]. */
function ramp(u: number, a: number, b: number) {
  const t = Math.min(1, Math.max(0, (u - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/* ─── IDLE ACTS ───────────────────────────────────────────────── */

/**
 * Something for the avatar to do when nobody is driving it.
 *
 * `u` runs 0 → 1 across the act and `t` is seconds since it started; acts
 * use `u` for the shape of the movement and `t` for anything that should
 * oscillate at a fixed rate regardless of how long the act lasts.
 */
export interface IdleAct {
  id: string
  seconds: number
  pose: (out: Pose, u: number, t: number) => void
}

export const idleActs: IdleAct[] = [
  {
    /* Looks around. The one that reads best from behind, which is where the
       camera nearly always is. */
    id: 'survey',
    seconds: 4.4,
    pose: (out, u) => {
      const sweep = Math.sin(u * Math.PI * 2) * arc(u)
      out.headYaw = sweep * 0.95
      out.headRoll = -sweep * 0.12
      out.bodyYaw = sweep * 0.3
      out.bodyY = Math.sin(u * Math.PI * 4) * 0.012
    },
  },
  {
    /* A long stretch. Arms overhead, chest open, heels lifting. */
    id: 'stretch',
    seconds: 3.4,
    pose: (out, u) => {
      const k = arc(u)
      out.armLPitch = -2.55 * k
      out.armRPitch = -2.55 * k
      out.armLRoll = -0.34 * k
      out.armRRoll = 0.34 * k
      out.bodyPitch = -0.2 * k
      out.headPitch = -0.3 * k
      out.bodyY = 0.11 * k
      out.legLPitch = 0.06 * k
      out.legRPitch = -0.06 * k
    },
  },
  {
    /* Checks the gauge on the wrist, the way anyone in a suit would. */
    id: 'gauge',
    seconds: 3.8,
    pose: (out, u, t) => {
      const k = ramp(u, 0, 0.22) * (1 - ramp(u, 0.78, 1))
      out.armRPitch = -1.95 * k
      out.armRRoll = 0.55 * k
      out.armLPitch = -0.22 * k
      out.headPitch = 0.42 * k
      out.headYaw = 0.26 * k
      out.bodyPitch = 0.1 * k
      /* A tap on the display, twice, while the arm is up. */
      out.armLRoll = Math.sin(t * 11) * 0.05 * k
    },
  },
  {
    /* Cuts the gravity for a moment and floats. The thruster is already
       modelled, and this is the only act that admits we are in space. */
    id: 'hover',
    seconds: 5,
    pose: (out, u, t) => {
      const k = arc(u)
      out.bodyY = 0.52 * k
      out.thrust = k
      out.legLPitch = -0.62 * k
      out.legRPitch = -0.46 * k
      out.armLRoll = -0.5 * k
      out.armRRoll = 0.5 * k
      out.armLPitch = -0.35 * k
      out.armRPitch = -0.35 * k
      out.bodyRoll = Math.sin(t * 1.5) * 0.09 * k
      out.bodyPitch = Math.sin(t * 1.1) * 0.07 * k - 0.12 * k
      out.headPitch = -0.14 * k
    },
  },
  {
    /* Two quick shrugs. Short, so it reads as punctuation between the
       longer acts rather than as a performance. */
    id: 'shrug',
    seconds: 2.4,
    pose: (out, u) => {
      const k = arc(u)
      const beat = Math.abs(Math.sin(u * Math.PI * 2))
      out.armLRoll = -(0.34 + beat * 0.3) * k
      out.armRRoll = (0.34 + beat * 0.3) * k
      out.armLPitch = -0.42 * k
      out.armRPitch = -0.42 * k
      out.bodyY = beat * 0.06 * k
      out.headRoll = 0.16 * k
      out.headPitch = 0.12 * k
    },
  },
  {
    /* Waves at the camera. Only ever funny once, which is why it is one of
       seven and never twice in a row. */
    id: 'wave',
    seconds: 3.2,
    pose: (out, u, t) => {
      const k = ramp(u, 0, 0.18) * (1 - ramp(u, 0.8, 1))
      out.armRPitch = -2.35 * k
      out.armRRoll = (0.3 + Math.sin(t * 8.5) * 0.34) * k
      out.headYaw = -0.2 * k
      out.headRoll = 0.14 * k
      out.bodyYaw = -0.14 * k
      out.bodyY = Math.sin(t * 4.2) * 0.02 * k
    },
  },
  {
    /* Crouches to read something on the deck. Puts the helmet where the
       light is, which is the actual reason it looks good. */
    id: 'inspect',
    seconds: 4,
    pose: (out, u) => {
      const k = ramp(u, 0, 0.24) * (1 - ramp(u, 0.76, 1))
      out.bodyY = -0.26 * k
      out.squash = 1 - 0.13 * k
      out.bodyPitch = 0.34 * k
      out.headPitch = 0.36 * k
      out.legLPitch = -0.5 * k
      out.legRPitch = -0.5 * k
      out.armLPitch = -1.15 * k
      out.armRPitch = -0.5 * k
      out.armRRoll = 0.2 * k
    },
  },
]

/* ─── THE DIRECTOR ────────────────────────────────────────────── */

/** Seconds of stillness before the first act starts. */
const SETTLE = 2.6
/** Rest between acts. */
const REST_MIN = 2.2
const REST_SPREAD = 3.4

export interface IdleDirector {
  /** The pose to blend toward. Owned by the director; do not keep a copy. */
  readonly pose: Pose
  /**
   * Advances the routine. `calm` is true while the avatar is standing still
   * on the ground with nothing else to do. Returns how much of the idle pose
   * should be mixed in, 0 → 1.
   */
  update: (dt: number, calm: boolean) => number
}

export function createIdleDirector(): IdleDirector {
  const pose = neutralPose()
  let act: IdleAct | null = null
  let clock = 0
  let rest = SETTLE
  let previous = -1
  let blend = 0

  const pick = () => {
    /* Never the same act twice running: repetition is what makes a loop
       look like a loop. */
    let index = Math.floor(Math.random() * idleActs.length)
    if (index === previous) index = (index + 1 + Math.floor(Math.random() * (idleActs.length - 1))) % idleActs.length
    previous = index
    return idleActs[index]
  }

  return {
    pose,
    update(dt, calm) {
      if (!calm) {
        /* Interrupted. The pose is left where it was and faded out, so
           walking away from a stretch lowers the arms instead of dropping
           them. */
        act = null
        clock = 0
        rest = SETTLE
        blend = Math.max(0, blend - dt * 6)
        return blend
      }

      clock += dt

      if (act) {
        if (clock >= act.seconds) {
          act = null
          clock = 0
          rest = REST_MIN + Math.random() * REST_SPREAD
        }
      } else if (clock >= rest) {
        act = pick()
        clock = 0
      }

      if (act) {
        resetPose(pose)
        act.pose(pose, clock / act.seconds, clock)
      }

      blend += ((act ? 1 : 0) - blend) * Math.min(1, dt * 6)
      return blend
    },
  }
}
