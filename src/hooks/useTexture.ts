import { useEffect, useMemo } from 'react'
import type * as THREE from 'three'

/**
 * A procedural texture that is released when its owner unmounts.
 *
 * Nothing disposes of a runtime-generated texture for us, so without this
 * every remount would leak a GPU upload — and the scene remounts on a lost
 * context and on React's double-invoked effects in development.
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
