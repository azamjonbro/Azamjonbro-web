import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HALF_D, HALF_W, ROOM } from '@/lib/layout'
import {
  createCityTexture,
  createFabricTexture,
  createNoiseRoughness,
  createRugTexture,
} from '@/lib/textures'
import { Hotspot } from './Hotspot'

/* ─── FLOOR, WALLS, CEILING ───────────────────────────────────── */
export function Shell() {
  const rug = useMemo(() => createRugTexture(), [])
  const floorRough = useMemo(() => createNoiseRoughness(190, 70), [])

  return (
    <group>
      {/* Dark stained wood floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <meshStandardMaterial
          color="#100e12"
          roughness={0.55}
          roughnessMap={floorRough}
          metalness={0.15}
          envMapIntensity={0.4}
        />
      </mesh>

      <FloorPlanks />

      {/* Rug under the chair */}
      <mesh position={[0.2, 0.004, -0.15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.5, 1.9]} />
        <meshStandardMaterial map={rug} roughness={0.98} metalness={0} />
      </mesh>

      {/* Back wall, cut around the window opening */}
      <BackWall />

      {/* Left wall */}
      <mesh position={[-HALF_W, ROOM.height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM.depth, ROOM.height]} />
        <meshStandardMaterial color="#131219" roughness={0.95} metalness={0.02} />
      </mesh>

      {/* Right wall */}
      <mesh position={[HALF_W, ROOM.height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM.depth, ROOM.height]} />
        <meshStandardMaterial color="#131219" roughness={0.95} metalness={0.02} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, ROOM.height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#0d0c12" roughness={1} />
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
      </mesh>

      <Baseboards />
      <Window />
      <Curtains />
      <BackShelf />
    </group>
  )
}

/* ─── SUBTLE PLANK SEAMS ──────────────────────────────────────── */
function FloorPlanks() {
  const geometry = useMemo(() => {
    const points: number[] = []
    for (let z = -HALF_D; z <= HALF_D; z += 0.22) {
      points.push(-HALF_W, 0.0015, z, HALF_W, 0.0015, z)
    }
    return new Float32Array(points)
  }, [])

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[geometry, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#000000" transparent opacity={0.55} />
    </lineSegments>
  )
}

/* ─── BACK WALL WITH A WINDOW OPENING ─────────────────────────── */
const WINDOW = { x0: 0.55, x1: 1.95, y0: 0.92, y1: 2.42 }

function BackWall() {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-HALF_W, 0)
    s.lineTo(HALF_W, 0)
    s.lineTo(HALF_W, ROOM.height)
    s.lineTo(-HALF_W, ROOM.height)
    s.closePath()

    const hole = new THREE.Path()
    hole.moveTo(WINDOW.x0, WINDOW.y0)
    hole.lineTo(WINDOW.x1, WINDOW.y0)
    hole.lineTo(WINDOW.x1, WINDOW.y1)
    hole.lineTo(WINDOW.x0, WINDOW.y1)
    hole.closePath()
    s.holes.push(hole)

    return s
  }, [])

  return (
    <mesh position={[0, 0, -HALF_D]} receiveShadow>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial
        color="#15141c"
        roughness={0.95}
        metalness={0.02}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/* ─── WINDOW, BLINDS AND THE CITY BEYOND ──────────────────────── */
function Window() {
  const city = useMemo(() => createCityTexture(), [])
  const cx = (WINDOW.x0 + WINDOW.x1) / 2
  const cy = (WINDOW.y0 + WINDOW.y1) / 2
  const w = WINDOW.x1 - WINDOW.x0
  const h = WINDOW.y1 - WINDOW.y0

  return (
    <group position={[0, 0, -HALF_D]}>
      {/* City plate, set back so it reads as distance. Outside the hotspot:
          nothing occludes a raycast, so a plate this large would otherwise
          swallow a third of the screen. */}
      <mesh position={[cx, cy, -0.5]}>
        <planeGeometry args={[w + 1.4, h + 1.2]} />
        <meshBasicMaterial map={city} toneMapped={false} />
      </mesh>

      <Hotspot id="window">
        {/* Glass */}
        <mesh position={[cx, cy, 0.012]}>
          <planeGeometry args={[w, h]} />
          <meshPhysicalMaterial
            transparent
            opacity={0.14}
            roughness={0.05}
            metalness={0}
            color="#a8c4ff"
          />
        </mesh>
      </Hotspot>

      {/* Frame */}
      {[
        { p: [cx, WINDOW.y1 + 0.035, 0.02], s: [w + 0.11, 0.07, 0.1] },
        { p: [cx, WINDOW.y0 - 0.035, 0.02], s: [w + 0.11, 0.07, 0.1] },
        { p: [WINDOW.x0 - 0.035, cy, 0.02], s: [0.07, h + 0.07, 0.1] },
        { p: [WINDOW.x1 + 0.035, cy, 0.02], s: [0.07, h + 0.07, 0.1] },
        { p: [cx, cy, 0.018], s: [0.035, h, 0.05] },
      ].map((bar, i) => (
        <mesh key={i} position={bar.p as [number, number, number]} castShadow>
          <boxGeometry args={bar.s as [number, number, number]} />
          <meshStandardMaterial color="#0c0b10" roughness={0.7} metalness={0.25} />
        </mesh>
      ))}

      {/* Half-drawn venetian blinds across the top */}
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh key={i} position={[cx, WINDOW.y1 - 0.05 - i * 0.045, 0.05]} rotation={[0.55, 0, 0]}>
          <boxGeometry args={[w - 0.03, 0.036, 0.006]} />
          <meshStandardMaterial color="#07070b" roughness={0.9} metalness={0.05} />
        </mesh>
      ))}
    </group>
  )
}

/* ─── HEAVY BLUE VELVET CURTAINS ──────────────────────────────── */
function Curtains() {
  const fabric = useMemo(() => createFabricTexture('#152648'), [])
  const left = useRef<THREE.Group>(null)
  const right = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (left.current) left.current.rotation.y = Math.sin(t * 0.25) * 0.012
    if (right.current) right.current.rotation.y = Math.sin(t * 0.25 + 1.4) * 0.012
  })

  return (
    <group position={[0, 0, -HALF_D + 0.13]}>
      {/* Rod */}
      <mesh position={[1.25, 2.62, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.016, 0.016, 2.3, 12]} />
        <meshStandardMaterial color="#1d1c22" metalness={0.8} roughness={0.3} />
      </mesh>

      <group ref={left} position={[0.18, 0, 0]}>
        <Drape fabric={fabric} folds={6} width={0.5} height={2.56} />
      </group>
      <group ref={right} position={[1.72, 0, 0]}>
        <Drape fabric={fabric} folds={7} width={0.58} height={2.56} />
      </group>
    </group>
  )
}

function Drape({
  fabric,
  folds,
  width,
  height,
}: {
  fabric: THREE.Texture
  folds: number
  width: number
  height: number
}) {
  const foldWidth = width / folds

  return (
    <group position={[0, height / 2 + 0.02, 0]}>
      {Array.from({ length: folds }).map((_, i) => {
        const depth = Math.sin((i / (folds - 1)) * Math.PI) * 0.05
        return (
          <mesh key={i} position={[i * foldWidth, 0, depth]} castShadow receiveShadow>
            <cylinderGeometry
              args={[foldWidth * 0.62, foldWidth * 0.72, height, 10, 1, false, 0, Math.PI]}
            />
            <meshStandardMaterial
              map={fabric}
              color="#1b3466"
              roughness={0.94}
              metalness={0}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </group>
  )
}

/* ─── BASEBOARDS ──────────────────────────────────────────────── */
function Baseboards() {
  return (
    <group>
      <mesh position={[0, 0.05, -HALF_D + 0.015]}>
        <boxGeometry args={[ROOM.width, 0.1, 0.03]} />
        <meshStandardMaterial color="#0e0d13" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[-HALF_W + 0.015, 0.05, 0]}>
        <boxGeometry args={[0.03, 0.1, ROOM.depth]} />
        <meshStandardMaterial color="#0e0d13" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[HALF_W - 0.015, 0.05, 0]}>
        <boxGeometry args={[0.03, 0.1, ROOM.depth]} />
        <meshStandardMaterial color="#0e0d13" roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  )
}

/* ─── FLOATING SHELF ON THE BACK WALL ─────────────────────────── */
function BackShelf() {
  return (
    <group position={[-0.42, 2.16, -HALF_D + 0.13]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.92, 0.035, 0.22]} />
        <meshStandardMaterial color="#16151c" roughness={0.45} metalness={0.3} />
      </mesh>

      {/* LED underglow */}
      <mesh position={[0, -0.024, 0.08]}>
        <boxGeometry args={[0.86, 0.008, 0.008]} />
        <meshStandardMaterial color="#a78bfa" emissive="#8b5cf6" emissiveIntensity={3.5} toneMapped={false} />
      </mesh>

      {/* Small books lying flat */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.32 + i * 0.03, 0.038 + i * 0.026, 0.01]} rotation={[0, 0.1 * i, 0]} castShadow>
          <boxGeometry args={[0.2, 0.026, 0.15]} />
          <meshStandardMaterial color={['#242433', '#1a1a26', '#2e2a3d'][i]} roughness={0.85} />
        </mesh>
      ))}

      {/* Framed picture leaning against the wall */}
      <group position={[0.02, 0.13, -0.05]} rotation={[0.1, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.19, 0.24, 0.012]} />
          <meshStandardMaterial color="#0f0e14" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.008]}>
          <planeGeometry args={[0.155, 0.2]} />
          <meshStandardMaterial color="#2a2440" emissive="#6d5bd0" emissiveIntensity={0.25} roughness={0.6} />
        </mesh>
      </group>

      {/* Small shelf plant */}
      <group position={[0.34, 0.06, 0.01]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.045, 0.038, 0.08, 14]} />
          <meshStandardMaterial color="#1c1b22" roughness={0.85} />
        </mesh>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          const r = 0.02 + (i % 2) * 0.014
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * r, 0.055 + (i % 3) * 0.016, Math.sin(a) * r]}
              castShadow
            >
              <sphereGeometry args={[0.021, 8, 6]} />
              <meshStandardMaterial color={i % 2 ? '#2f6b3c' : '#3f8a4c'} roughness={0.75} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}
