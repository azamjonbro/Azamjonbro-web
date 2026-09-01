import * as THREE from 'three'

/**
 * The destinations on the station, and the single source of truth for where
 * everything is.
 *
 * The world places its architecture from this list, the player collides
 * against it, the HUD names it, and the accessible fallback renders the same
 * order as a document. Adding a destination is one entry here.
 */
export type ZoneId = 'about' | 'projects' | 'skills' | 'experience' | 'process' | 'lab' | 'contact'

export interface Zone {
  id: ZoneId
  /** Shown on the marker and in the HUD. */
  label: string
  /** Small technical caption under the label. */
  caption: string
  /** Centre of the pad, on the station floor. */
  position: THREE.Vector3
  /** Facing, in radians, so the display turns toward the station centre. */
  rotation: number
  /** Radius within which the interact prompt appears. */
  radius: number
  accent: string
}

/** Pads sit on a ring around the hub, evenly spaced and facing inward. */
const RING = 26

function onRing(index: number, total: number, radius = RING) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2
  return {
    position: new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
    /* Turns the face back toward the hub: a plane's normal after a yaw of θ
       is (sin θ, 0, cos θ), and we want it to equal −(cos a, 0, sin a). */
    rotation: -angle - Math.PI / 2,
  }
}

const order: Array<Omit<Zone, 'position' | 'rotation'>> = [
  { id: 'about', label: 'ABOUT', caption: 'IDENTITY', radius: 7, accent: '#5ad1ff' },
  { id: 'projects', label: 'PROJECTS', caption: '07 EXHIBITS', radius: 11, accent: '#7dffb0' },
  { id: 'skills', label: 'SKILLS', caption: 'SYSTEMS', radius: 7, accent: '#ffd36e' },
  { id: 'experience', label: 'EXPERIENCE', caption: 'MISSION LOG', radius: 7, accent: '#ff9bd2' },
  { id: 'process', label: 'PROCESS', caption: 'IDEA → PRODUCTION', radius: 7, accent: '#c4a4ff' },
  { id: 'lab', label: 'LAB', caption: 'BLOG', radius: 6, accent: '#8f9bb8' },
  { id: 'contact', label: 'CONTACT', caption: 'UPLINK', radius: 8, accent: '#ffffff' },
]

export const zones: Zone[] = order.map((z, i) => ({ ...z, ...onRing(i, order.length) }))

export function getZone(id: ZoneId) {
  return zones.find((z) => z.id === id)!
}

/** Where the player is standing when the world opens. */
export const SPAWN = new THREE.Vector3(0, 0, 8)

/** The player cannot walk past this; the station ends here. */
export const STATION_RADIUS = RING + 14
