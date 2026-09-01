import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useProceduralTexture } from '@/hooks/useTexture'
import {
  createNebula,
  createPlanetTexture,
  createStarSprite,
} from '@/lib/spaceTextures'
import { useWorld } from '@/state/WorldContext'

/**
 * Everything outside the station: the starfield, the planet it orbits and
 * the haze between them.
 *
 * All of it sits far enough out to be parallax rather than scenery, and none
 * of it is lit — space has one light source and it is behind the camera.
 */
export function Cosmos() {
  return (
    <>
      <Starfield />
      <Planet />
      <Nebula />
    </>
  )
}

/* ─── STARS ───────────────────────────────────────────────────── */

function Starfield() {
  const { quality, reducedMotion } = useWorld()
  const sprite = useProceduralTexture(createStarSprite)
  const points = useRef<THREE.Points>(null)

  /**
   * Positions are sampled on a shell rather than in a ball: stars inside the
   * shell would sit between the camera and the station and read as dust.
   * Colour carries the brightness variation so one draw call covers the sky.
   */
  const geometry = useMemo(() => {
    const count = quality.starCount
    const position = new Float32Array(count * 3)
    const color = new Float32Array(count * 3)
    const scale = new Float32Array(count)
    const tint = new THREE.Color()

    for (let i = 0; i < count; i++) {
      const u = Math.random()
      const v = Math.random()
      const theta = u * Math.PI * 2
      const phi = Math.acos(2 * v - 1)
      const r = 620 + Math.random() * 380

      position[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      position[i * 3 + 1] = r * Math.cos(phi)
      position[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)

      /* Mostly white, a minority warm or blue — a sky of identical white
         dots reads as noise rather than as stars. */
      const roll = Math.random()
      if (roll > 0.93) tint.setHSL(0.08, 0.5, 0.78)
      else if (roll > 0.82) tint.setHSL(0.58, 0.45, 0.8)
      else tint.setHSL(0.6, 0.06, 0.68 + Math.random() * 0.32)

      const brightness = 0.35 + Math.pow(Math.random(), 2.2) * 0.65
      color[i * 3] = tint.r * brightness
      color[i * 3 + 1] = tint.g * brightness
      color[i * 3 + 2] = tint.b * brightness
      scale[i] = brightness
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(position, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(color, 3))
    geo.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))
    return geo
  }, [quality.starCount])

  /* The geometry is built here, so it is disposed here. */
  useMemo(() => geometry, [geometry])

  useFrame((_, delta) => {
    if (reducedMotion || !points.current) return
    /* A slow roll, well under the threshold of noticing, that keeps the sky
       from reading as a painted backdrop. */
    points.current.rotation.y += delta * 0.0035
  })

  return (
    <points ref={points} frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial
        size={2.6}
        map={sprite}
        vertexColors
        transparent
        opacity={0.95}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}

/* ─── PLANET ──────────────────────────────────────────────────── */

/**
 * A rim-lit atmosphere shell.
 *
 * Drawn on the back faces with additive blending, so the glow is strongest
 * where the surface turns away from the camera — which is exactly where a
 * real atmosphere is thickest along the view ray.
 */
const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const atmosphereFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uStrength;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - abs(dot(vNormal, vView)), uPower);
    gl_FragColor = vec4(uColor * rim * uStrength, rim);
  }
`

function Planet() {
  const { reducedMotion } = useWorld()
  const map = useProceduralTexture(createPlanetTexture)
  const body = useRef<THREE.Mesh>(null)

  const atmosphere = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        uniforms: {
          uColor: { value: new THREE.Color('#5f9dff') },
          uPower: { value: 2.6 },
          uStrength: { value: 1.35 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  )

  useFrame((_, delta) => {
    if (reducedMotion || !body.current) return
    body.current.rotation.y += delta * 0.006
  })

  return (
    <group position={[-190, 46, -420]}>
      <mesh ref={body}>
        <sphereGeometry args={[118, 64, 48]} />
        <meshStandardMaterial map={map} roughness={1} metalness={0} />
      </mesh>

      <mesh scale={1.055}>
        <sphereGeometry args={[118, 48, 32]} />
        <primitive object={atmosphere} attach="material" />
      </mesh>

      {/* The star this system orbits, implied rather than drawn: one distant
          directional source keyed to the planet's lit edge. */}
      <pointLight position={[260, 120, 210]} intensity={2.2} color="#cfe2ff" distance={900} decay={0} />
    </group>
  )
}

/* ─── HAZE ────────────────────────────────────────────────────── */

function Nebula() {
  const map = useProceduralTexture(createNebula)

  return (
    <group>
      {[
        { p: [-260, 90, -540] as const, s: 900, r: 0.3 },
        { p: [420, -60, -620] as const, s: 1100, r: -0.5 },
      ].map((n, i) => (
        <mesh key={i} position={n.p as unknown as THREE.Vector3Tuple} rotation={[0, 0, n.r]}>
          <planeGeometry args={[n.s, n.s]} />
          <meshBasicMaterial
            map={map}
            transparent
            opacity={0.5}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}
