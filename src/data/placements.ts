/**
 * Where every movable object sits in the room.
 *
 * Props read their transform from here rather than hard-coding it, so the
 * layout can be rearranged at runtime and exported straight back into this
 * file. Positions are metres in world space; rotations are radians.
 */
export type MovableId =
  | 'monitor'
  | 'macbook'
  | 'keyboard'
  | 'mouse'
  | 'headphones'
  | 'microphone'
  | 'cactus'
  | 'plant'
  | 'books'
  | 'speaker'
  | 'clock'
  | 'ringLight'
  | 'chair'
  | 'swisswatch'
  | 'hadiya'
  | 'ctf'

export type Vec3 = [number, number, number]

export interface Placement {
  position: Vec3
  rotation: Vec3
  /**
   * Which plane the object slides along while dragging.
   * `desk` and `floor` slide horizontally; `wall` slides up the back wall.
   */
  plane: 'desk' | 'floor' | 'wall'
  label: string
}

export const defaultPlacements: Record<MovableId, Placement> = {
  monitor: {
    position: [0.22, 1.24, -1.58],
    rotation: [0, -0.07, 0],
    plane: 'desk',
    label: 'Monitor + arm',
  },
  macbook: {
    position: [0.92, 1.02, -1.3],
    rotation: [0, -0.5, 0],
    plane: 'desk',
    label: 'MacBook + arm',
  },
  keyboard: {
    position: [0.02, 0.754, -1.0],
    rotation: [0, -0.05, 0],
    plane: 'desk',
    label: 'Keyboard',
  },
  mouse: {
    position: [0.43, 0.754, -0.98],
    rotation: [0, -0.08, 0],
    plane: 'desk',
    label: 'Mouse',
  },
  headphones: {
    position: [-0.52, 0.75, -1.0],
    rotation: [0, 0.6, 0],
    plane: 'desk',
    label: 'Headphones',
  },
  microphone: {
    position: [-0.74, 0.75, -1.32],
    rotation: [0, 0, 0],
    plane: 'desk',
    label: 'Microphone',
  },
  cactus: {
    position: [-0.82, 0.75, -1.5],
    rotation: [0, 0, 0],
    plane: 'desk',
    label: 'Cactus',
  },
  plant: {
    position: [1.3, 0.75, -1.0],
    rotation: [0, 0, 0],
    plane: 'desk',
    label: 'Terrarium',
  },
  books: {
    position: [-1.02, 0.75, -1.36],
    rotation: [0, 0.32, 0],
    plane: 'desk',
    label: 'Books',
  },
  speaker: {
    position: [0.62, 0.75, -0.78],
    rotation: [0, 0, 0],
    plane: 'desk',
    label: 'Speaker',
  },
  clock: {
    position: [-1.42, 0.885, -1.6],
    rotation: [0, 0.16, 0],
    plane: 'desk',
    label: 'Digital clock',
  },
  ringLight: {
    position: [1.72, 0, -0.78],
    rotation: [0, 0, 0],
    plane: 'floor',
    label: 'Ring light',
  },
  chair: {
    position: [-0.92, 0, -0.4],
    rotation: [0, Math.PI - 0.66, 0],
    plane: 'floor',
    label: 'Chair',
  },
  swisswatch: {
    position: [-1.45, 2.02, -1.76],
    rotation: [0, 0, 0],
    plane: 'wall',
    label: 'SwissWatch display',
  },
  hadiya: {
    position: [-1.45, 1.55, -1.76],
    rotation: [0, 0, 0],
    plane: 'wall',
    label: 'Hadiya display',
  },
  ctf: {
    position: [-1.45, 1.08, -1.76],
    rotation: [0, 0, 0],
    plane: 'wall',
    label: 'CTF display',
  },
}

export const movableIds = Object.keys(defaultPlacements) as MovableId[]

export function isMovable(id: string): id is MovableId {
  return id in defaultPlacements
}

/** Deep copy, so callers can mutate a layout without touching the defaults. */
export function cloneDefaults(): Record<MovableId, Placement> {
  return Object.fromEntries(
    movableIds.map((id) => [
      id,
      {
        ...defaultPlacements[id],
        position: [...defaultPlacements[id].position] as Vec3,
        rotation: [...defaultPlacements[id].rotation] as Vec3,
      },
    ]),
  ) as Record<MovableId, Placement>
}

/** Renders a layout as a snippet that can be pasted back into this file. */
export function toSource(layout: Record<MovableId, Placement>) {
  const n = (v: number) => {
    const r = Math.round(v * 1000) / 1000
    return Object.is(r, -0) ? '0' : String(r)
  }

  const body = movableIds
    .map((id) => {
      const p = layout[id]
      return [
        `  ${id}: {`,
        `    position: [${p.position.map(n).join(', ')}],`,
        `    rotation: [${p.rotation.map(n).join(', ')}],`,
        `    plane: '${p.plane}',`,
        `    label: '${p.label}',`,
        `  },`,
      ].join('\n')
    })
    .join('\n')

  return `export const defaultPlacements: Record<MovableId, Placement> = {\n${body}\n}\n`
}
