/**
 * The state of a trip between worlds, as numbers rather than as React state.
 *
 * The camera has to know it is watching a launch on the frame the launch
 * starts, and the avatar has to know it is no longer walking — both read this
 * every frame. The context still owns *which* world we are on, because that
 * decides what renders; this owns only what changes sixty times a second.
 */
export type Flight = 'grounded' | 'launch' | 'fall'

export const journey = {
  phase: 'grounded' as Flight,
  /** Seconds spent in the current phase. */
  t: 0,
  /**
   * How far the camera should stand off, 0 → 1.
   *
   * Ramps up as the avatar leaves the deck and decays once it is down, so
   * the whole trip is one continuous move rather than a cut to a wide shot.
   */
  detach: 0,
}

export function resetJourney() {
  journey.phase = 'grounded'
  journey.t = 0
  journey.detach = 0
}
