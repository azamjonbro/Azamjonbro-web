import { SpaceScene } from './SpaceScene'

/**
 * The single lazily imported entry to everything that needs three.js.
 *
 * Isolated behind a default export so App can reach it with a dynamic
 * import, which is what keeps the renderer out of the bundle a phone
 * downloads for the landing page.
 */
export default function World() {
  return <SpaceScene />
}
