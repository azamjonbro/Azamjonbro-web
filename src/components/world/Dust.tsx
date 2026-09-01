import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { STATION_RADIUS } from '@/data/zones'
import { useProceduralTexture } from '@/hooks/useTexture'
import { createStarSprite } from '@/lib/spaceTextures'
import { useWorld } from '@/state/WorldContext'

/**
 * Particulate drifting over the deck.
 *
 * The one job of this is scale: without something small and near moving
 * against the station, the whole structure reads as a model on a table
 * rather than as a place with size.
 */
export function Dust() {
  const { quality, reducedMotion } = useWorld()
  const sprite = useProceduralTexture(createStarSprite)
  const points = useRef<THREE.Points>(null)

  const { geometry, drift } = useMemo(() => {
    const count = quality.dustCount
    const position = new Float32Array(count * 3)
    const drift = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.sqrt(Math.random()) * STATION_RADIUS
      position[i * 3] = Math.cos(angle) * radius
      position[i * 3 + 1] = Math.random() * 16
      position[i * 3 + 2] = Math.sin(angle) * radius

      drift[i * 3] = (Math.random() - 0.5) * 0.16
      drift[i * 3 + 1] = 0.08 + Math.random() * 0.2
      drift[i * 3 + 2] = (Math.random() - 0.5) * 0.16
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(position, 3))
    return { geometry: geo, drift }
  }, [quality.dustCount])

  useFrame((_, delta) => {
    if (reducedMotion || !points.current) return
    const dt = Math.min(delta, 0.1)
    const attr = points.current.geometry.attributes.position as THREE.BufferAttribute
    const array = attr.array as Float32Array

    for (let i = 0; i < array.length / 3; i++) {
      array[i * 3] += drift[i * 3] * dt
      array[i * 3 + 1] += drift[i * 3 + 1] * dt
      array[i * 3 + 2] += drift[i * 3 + 2] * dt
      /* Recycle from the top rather than respawning at random, so density
         stays even instead of pooling. */
      if (array[i * 3 + 1] > 16) array[i * 3 + 1] = 0
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={points} frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial
        size={0.16}
        map={sprite}
        color="#9fc4e8"
        transparent
        opacity={0.32}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}
