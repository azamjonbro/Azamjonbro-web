import * as THREE from 'three'
import { getZone } from '@/data/zones'
import { projects } from '@/data/projects'

/**
 * Layout of the projects bay.
 *
 * The seven exhibits stand on an arc facing the walkway, so a visitor
 * arriving from the hub sees all of them at once and can walk the line.
 * Both the monoliths and the player's proximity test read these positions,
 * so an exhibit cannot end up somewhere the prompt does not appear.
 */
export const PROJECT_BAY = {
  /** Radius of the arc the exhibits stand on. */
  radius: 13,
  /** How much of a circle the arc covers. */
  spread: Math.PI * 1.02,
  /** How close the player must be for an exhibit to activate. */
  slotRadius: 4.4,
} as const

const centre = /* @__PURE__ */ getZone('projects').position.clone()

/** Direction from the hub out to the bay — the arc opens back toward it. */
const facing = /* @__PURE__ */ Math.atan2(centre.z, centre.x)

export function projectSlotPosition(index: number, out = new THREE.Vector3()) {
  const total = projects.length
  const t = total === 1 ? 0.5 : index / (total - 1)
  const angle = facing - PROJECT_BAY.spread / 2 + t * PROJECT_BAY.spread

  return out.set(
    centre.x + Math.cos(angle) * PROJECT_BAY.radius,
    0,
    centre.z + Math.sin(angle) * PROJECT_BAY.radius,
  )
}

/** Yaw that turns an exhibit's face back toward the centre of the bay. */
export function projectSlotRotation(index: number) {
  const p = projectSlotPosition(index)
  return Math.atan2(centre.x - p.x, centre.z - p.z)
}

export const BAY_CENTRE = centre
