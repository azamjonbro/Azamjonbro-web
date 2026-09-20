/**
 * Every surface the avatar can stand on.
 *
 * The station is one of these rather than a special case — it has a gravity,
 * a radius and a rim like anywhere else, which is what lets the movement code
 * treat leaving home and leaving a moon as the same manoeuvre.
 *
 * Free of three.js for the same reason `data/zones` is: the HUD reads it, and
 * the HUD ships in the bundle a phone downloads before it has agreed to load
 * a renderer.
 */
import { STATION_RADIUS } from './zones'

export type PlanetId = 'station' | 'ember' | 'verdant' | 'glacier' | 'ashfall'

export interface Planet {
  id: PlanetId
  /** Shown large on the arrival card. */
  name: string
  /** The small line under it. */
  caption: string
  /** Surface gravity, m/s². The only number that changes how a jump feels. */
  gravity: number
  /** Walkable radius. Past this you are over the edge. */
  radius: number
  /**
   * How high you must be, at the edge, to clear it.
   *
   * The station has a structural rail, so it takes a real jump to get over;
   * an open plain only needs your feet off the ground.
   */
  rim: number
  /** Background and fog. */
  sky: string
  /** Fog near and far. */
  fog: readonly [number, number]
  ground: string
  rock: string
  accent: string
}

export const planets: Planet[] = [
  {
    id: 'station',
    name: 'AZAMJON STATION',
    caption: 'HOME ORBIT',
    gravity: 18,
    radius: STATION_RADIUS,
    rim: 1.15,
    sky: '#04050a',
    fog: [70, 240],
    ground: '#2a3140',
    rock: '#20252f',
    accent: '#5ad1ff',
  },
  {
    id: 'ember',
    name: 'KEPLER-442 b',
    caption: 'MOLTEN SHELF · 0.9 ATM',
    gravity: 24,
    radius: 40,
    rim: 0.5,
    sky: '#120506',
    fog: [40, 190],
    ground: '#3a1712',
    rock: '#5d2419',
    accent: '#ff7a45',
  },
  {
    id: 'verdant',
    name: 'TAU CETI e',
    caption: 'MOSS BASIN · BREATHABLE',
    gravity: 13,
    radius: 46,
    rim: 0.5,
    sky: '#05120d',
    fog: [46, 210],
    ground: '#14311f',
    rock: '#1e4a2f',
    accent: '#7dffb0',
  },
  {
    id: 'glacier',
    name: 'IO-9 RIME',
    caption: 'ICE FIELD · 0.3 g',
    gravity: 8,
    radius: 52,
    rim: 0.5,
    sky: '#060e18',
    fog: [52, 240],
    ground: '#1c2c3e',
    rock: '#2e4459',
    accent: '#9fdcff',
  },
  {
    id: 'ashfall',
    name: 'PROXIMA d',
    caption: 'ASH DUNES · NO ATM',
    gravity: 20,
    radius: 42,
    rim: 0.5,
    sky: '#0a0713',
    fog: [44, 200],
    ground: '#231e2d',
    rock: '#3b3247',
    accent: '#c4a4ff',
  },
]

export const HOME: PlanetId = 'station'

const byId = new Map(planets.map((p) => [p.id, p]))

export function getPlanet(id: PlanetId) {
  return byId.get(id) ?? planets[0]
}

/* Which world the next launch goes to. Trips out of the station walk the
   list in order so a second jump shows somewhere new; a trip from anywhere
   else always comes home, because the portfolio is there and getting lost
   between four moons is not a feature. */
let cursor = 0

export function nextDestination(from: PlanetId): PlanetId {
  if (from !== HOME) return HOME
  const away = planets.filter((p) => p.id !== HOME)
  const next = away[cursor % away.length]
  cursor++
  return next.id
}
