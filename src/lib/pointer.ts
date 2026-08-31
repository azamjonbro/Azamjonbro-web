/**
 * Pointer state that changes at frame rate.
 * Kept outside React so moving the mouse never triggers a re-render.
 */
export const pointer = {
  /** Normalised device coordinates, -1 → 1. */
  nx: 0,
  ny: 0,
  /** Raw client pixels, for DOM overlays like the tooltip. */
  x: 0,
  y: 0,
  /** False until the visitor actually moves the mouse. */
  active: false,
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

/** Frame-rate independent damping factor. */
export function damp(rate: number, delta: number) {
  return 1 - Math.exp(-rate * delta)
}
