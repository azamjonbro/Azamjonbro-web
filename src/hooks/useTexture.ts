import { useEffect, useMemo } from 'react'
import type * as THREE from 'three'

/**
 * A procedural texture that is released when its owner unmounts.
 *
 * Every texture in the room is drawn on a canvas at runtime, so nothing
 * disposes of them for us: without this each remount would leak a GPU
 * upload, and the room remounts whenever the renderer is torn down and
 * rebuilt (a context loss, or React 19's double-invoked effects in dev).
 */
export function useProceduralTexture<T extends THREE.Texture>(
  make: () => T,
  deps: unknown[] = [],
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const texture = useMemo(make, deps)

  useEffect(() => () => texture.dispose(), [texture])

  return texture
}
