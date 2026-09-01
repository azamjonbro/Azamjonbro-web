/**
 * How much scene this device should be asked to draw.
 *
 * Decided once, from what the browser will actually tell us. Everything
 * expensive reads the tier rather than checking `isMobile` in ten places
 * and drifting apart.
 */
export type Tier = 'low' | 'mid' | 'high'

export interface Quality {
  tier: Tier
  dpr: [number, number]
  shadows: boolean
  /** Ambient occlusion and depth of field both need a depth prepass. */
  heavyEffects: boolean
  bloom: boolean
  starCount: number
  dustCount: number
  /** Segment counts for the station's curved geometry. */
  ringSegments: number
}

export function detectQuality(): Quality {
  if (typeof window === 'undefined') {
    return { tier: 'high', dpr: [1, 2], shadows: true, heavyEffects: true, bloom: true, starCount: 5200, dustCount: 220, ringSegments: 96 }
  }

  const coarse = window.matchMedia('(hover: none)').matches
  const narrow = window.innerWidth < 900
  const cores = navigator.hardwareConcurrency ?? 4
  const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 4

  const low = coarse || narrow || cores <= 4 || memory <= 4
  const mid = !low && (cores <= 8 || memory <= 8)

  if (low) {
    return {
      tier: 'low',
      dpr: [1, 1.5],
      shadows: false,
      heavyEffects: false,
      bloom: true,
      starCount: 1400,
      dustCount: 60,
      ringSegments: 48,
    }
  }

  if (mid) {
    return {
      tier: 'mid',
      dpr: [1, 1.75],
      shadows: true,
      heavyEffects: false,
      bloom: true,
      starCount: 3200,
      dustCount: 140,
      ringSegments: 72,
    }
  }

  return {
    tier: 'high',
    dpr: [1, 2],
    shadows: true,
    heavyEffects: true,
    bloom: true,
    starCount: 5200,
    dustCount: 220,
    ringSegments: 96,
  }
}

/** True when the browser cannot give us a WebGL2 context at all. */
export function webglAvailable() {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}
