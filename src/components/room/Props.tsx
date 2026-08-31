import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MONITOR } from '@/lib/layout'
import { createClockTexture, createKeycapTexture, createMacBookTexture } from '@/lib/textures'
import { useRoom } from '@/state/RoomContext'
import { HitBox, Hotspot } from './Hotspot'
import { Movable } from './Movable'

/* ─── MONITOR ARM ─────────────────────────────────────────────── */
export function MonitorArm() {
  return (
    <group>
      {/* Clamp */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[0.09, 0.04, 0.09]} />
        <meshStandardMaterial color="#101014" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Post */}
      <mesh position={[0, 0.24, 0]} castShadow>
        <cylinderGeometry args={[0.019, 0.023, 0.44, 16]} />
        <meshStandardMaterial color="#101014" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Horizontal arm reaching to the panel */}
      <mesh position={[0, 0.45, 0.045]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.016, 0.016, 0.14, 12]} />
        <meshStandardMaterial color="#16161b" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* VESA plate */}
      <mesh position={[0, 0.47, 0.1]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.014]} />
        <meshStandardMaterial color="#16161b" roughness={0.35} metalness={0.75} />
      </mesh>
    </group>
  )
}

/* ─── MONITOR CHASSIS (the screen itself lives in MonitorScreen) ─ */
export function MonitorBody({ children }: { children?: React.ReactNode }) {
  const { screenWidth: sw, screenHeight: sh, bezel } = MONITOR

  return (
    <group>
      {/* Back shell */}
      <mesh position={[0, 0, -0.021] } castShadow receiveShadow>
        <boxGeometry args={[sw + bezel * 2, sh + bezel * 2 + 0.03, 0.03]} />
        <meshStandardMaterial color="#0b0b0e" roughness={0.55} metalness={0.35} />
      </mesh>

      {/* Bezel frame */}
      <mesh position={[0, -0.001, -0.004]}>
        <boxGeometry args={[sw + bezel * 2, sh + bezel * 2 + 0.028, 0.006]} />
        <meshStandardMaterial color="#0e0e12" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Chin with a status LED */}
      <mesh position={[0, -sh / 2 - 0.014, 0.0005]}>
        <boxGeometry args={[0.02, 0.003, 0.004]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#8b5cf6"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>

      {children}

      {/* Screen-bar light clipped to the top edge */}
      <group position={[0, sh / 2 + 0.045, 0.03]} rotation={[0.3, 0, 0]}>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.013, 0.013, 0.46, 14]} />
          <meshStandardMaterial color="#141418" roughness={0.35} metalness={0.75} />
        </mesh>
        <mesh position={[0, -0.011, 0.004]}>
          <boxGeometry args={[0.43, 0.005, 0.005]} />
          <meshStandardMaterial
            color="#fff3e0"
            emissive="#ffdcae"
            emissiveIntensity={1.1}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  )
}

/* ─── MACBOOK AIR M1 ON A LAPTOP ARM ──────────────────────────── */
export function MacBook() {
  const screen = useMemo(() => createMacBookTexture(), [])
  const { openResume } = useRoom()

  return (
    <Movable id="macbook">
      {/* Arm — the clamp on the desk, which is what gets dragged */}
      <group>
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[0.08, 0.04, 0.08]} />
          <meshStandardMaterial color="#101014" roughness={0.3} metalness={0.85} />
        </mesh>
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.017, 0.02, 0.2, 14]} />
          <meshStandardMaterial color="#101014" roughness={0.3} metalness={0.85} />
        </mesh>
        <mesh position={[-0.11, 0.23, 0.11]} rotation={[0, -0.75, 0.12]} castShadow>
          <boxGeometry args={[0.34, 0.024, 0.03]} />
          <meshStandardMaterial color="#15151a" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[-0.24, 0.25, 0.24]} rotation={[0, -0.5, 0]} castShadow>
          <boxGeometry args={[0.26, 0.012, 0.2]} />
          <meshStandardMaterial color="#15151a" roughness={0.35} metalness={0.75} />
        </mesh>
      </group>

      <Hotspot id="macbook" onSelect={openResume}>
        <group position={[-0.24, 0.27, 0.28]} rotation={[0, -0.5, 0]}>
          <HitBox size={[0.36, 0.26, 0.3]} position={[0, 0.1, -0.05]} />
          {/* Base */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.31, 0.011, 0.215]} />
            <meshStandardMaterial color="#b9bcc2" roughness={0.32} metalness={0.92} envMapIntensity={1.3} />
          </mesh>

          {/* Keyboard well */}
          <mesh position={[0, 0.0065, -0.024]}>
            <boxGeometry args={[0.256, 0.002, 0.108]} />
            <meshStandardMaterial color="#17171b" roughness={0.75} />
          </mesh>
          {/* Trackpad */}
          <mesh position={[0, 0.0065, 0.062]}>
            <boxGeometry args={[0.1, 0.002, 0.066]} />
            <meshStandardMaterial color="#a7aab0" roughness={0.28} metalness={0.75} />
          </mesh>

          {/* Lid */}
          <group position={[0, 0.005, -0.107]} rotation={[-0.28, 0, 0]}>
            <mesh position={[0, 0.107, 0]} castShadow>
              <boxGeometry args={[0.31, 0.214, 0.006]} />
              <meshStandardMaterial color="#b9bcc2" roughness={0.32} metalness={0.92} envMapIntensity={1.3} />
            </mesh>
            <mesh position={[0, 0.107, 0.0035]}>
              <planeGeometry args={[0.285, 0.19]} />
              <meshBasicMaterial map={screen} toneMapped={false} />
            </mesh>
            {/* Apple mark on the back of the lid */}
            <mesh position={[0, 0.107, -0.0035]} rotation={[0, Math.PI, 0]}>
              <circleGeometry args={[0.014, 20]} />
              <meshStandardMaterial
                color="#e9e9ee"
                emissive="#cfd2ff"
                emissiveIntensity={0.5}
                roughness={0.3}
              />
            </mesh>
          </group>
        </group>
      </Hotspot>
    </Movable>
  )
}

/* ─── RGB MECHANICAL KEYBOARD ─────────────────────────────────── */
export function Keyboard() {
  const caps = useMemo(() => createKeycapTexture(), [])

  return (
    <Movable id="keyboard">
      <Hotspot id="keyboard">
        <group>
          <HitBox size={[0.5, 0.09, 0.21]} position={[0, 0.03, 0]} />
          {/* Aluminium case */}
          <mesh position={[0, 0.011, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.45, 0.023, 0.158]} />
            <meshStandardMaterial color="#101015" roughness={0.35} metalness={0.7} />
          </mesh>
          {/* Underglow spilling onto the mat */}
          <mesh position={[0, 0.0015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.49, 0.2]} />
            <meshBasicMaterial color="#7c3aed" transparent opacity={0.28} toneMapped={false} />
          </mesh>
          {/* Keycap field */}
          <mesh position={[0, 0.0242, 0.002]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.43, 0.14]} />
            <meshStandardMaterial
              map={caps}
              emissiveMap={caps}
              emissive="#ffffff"
              emissiveIntensity={0.7}
              roughness={0.75}
              toneMapped={false}
            />
          </mesh>
        </group>
      </Hotspot>
    </Movable>
  )
}

/* ─── MOUSE ───────────────────────────────────────────────────── */
export function Mouse() {
  return (
    <Movable id="mouse">
      <Hotspot id="mouse">
        <group>
          <HitBox size={[0.11, 0.09, 0.15]} position={[0, 0.03, 0]} />
          <mesh position={[0, 0.016, 0]} castShadow>
            <sphereGeometry args={[0.036, 20, 14]} />
            <meshStandardMaterial color="#101015" roughness={0.42} metalness={0.25} />
          </mesh>
          {/* Flatten the sphere into a mouse silhouette */}
          <mesh position={[0, 0.004, 0]} scale={[1, 0.25, 1.5]}>
            <sphereGeometry args={[0.036, 20, 14]} />
            <meshStandardMaterial color="#0d0d11" roughness={0.42} metalness={0.25} />
          </mesh>
          <mesh position={[0, 0.03, -0.012]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.011, 10]} />
            <meshStandardMaterial
              color="#a78bfa"
              emissive="#8b5cf6"
              emissiveIntensity={2.2}
              toneMapped={false}
            />
          </mesh>
        </group>
      </Hotspot>
    </Movable>
  )
}

/* ─── HEADPHONES ──────────────────────────────────────────────── */
export function Headphones() {
  return (
    <Movable id="headphones">
      <Hotspot id="headphones">
        <group>
          <HitBox size={[0.26, 0.17, 0.15]} position={[0, 0.07, 0]} />
          {/* Ear cups, flat on the desk */}
          {([-1, 1] as const).map((side) => (
            <group key={side} position={[side * 0.075, 0.042, 0]} rotation={[0, 0, side * 0.1]}>
              <mesh castShadow receiveShadow>
                <cylinderGeometry args={[0.043, 0.04, 0.03, 22]} />
                <meshStandardMaterial color="#121216" roughness={0.5} metalness={0.3} />
              </mesh>
              {/* Leather pad facing outward */}
              <mesh position={[side * 0.017, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.041, 0.036, 0.014, 22]} />
                <meshStandardMaterial color="#1d1d24" roughness={0.95} />
              </mesh>
              {/* Yoke */}
              <mesh position={[0, 0.03, 0]} castShadow>
                <boxGeometry args={[0.012, 0.03, 0.05]} />
                <meshStandardMaterial color="#1a1a20" roughness={0.4} metalness={0.6} />
              </mesh>
            </group>
          ))}

          {/* Headband arcing between the cups */}
          <mesh position={[0, 0.042, 0]} castShadow>
            <torusGeometry args={[0.075, 0.011, 10, 26, Math.PI]} />
            <meshStandardMaterial color="#151519" roughness={0.45} metalness={0.35} />
          </mesh>
          {/* Padding along the underside of the band */}
          <mesh position={[0, 0.042, 0]}>
            <torusGeometry args={[0.068, 0.008, 8, 22, Math.PI]} />
            <meshStandardMaterial color="#232329" roughness={0.92} />
          </mesh>
        </group>
      </Hotspot>
    </Movable>
  )
}

/* ─── CONDENSER MICROPHONE ON A BOOM ARM ──────────────────────── */
export function Microphone() {
  return (
    <Movable id="microphone">
      <Hotspot id="microphone">
        <group>
          {/* Desk clamp */}
          <mesh position={[0, 0.025, 0]} castShadow>
            <boxGeometry args={[0.055, 0.05, 0.07]} />
            <meshStandardMaterial color="#0e0e12" roughness={0.35} metalness={0.8} />
          </mesh>
          {/* Vertical post */}
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.011, 0.013, 0.18, 12]} />
            <meshStandardMaterial color="#121216" roughness={0.35} metalness={0.8} />
          </mesh>
          {/* Upper boom segment */}
          <mesh position={[0.11, 0.29, 0.05]} rotation={[0.25, 0, -0.75]} castShadow>
            <cylinderGeometry args={[0.009, 0.009, 0.34, 10]} />
            <meshStandardMaterial color="#121216" roughness={0.35} metalness={0.8} />
          </mesh>
          {/* Elbow */}
          <mesh position={[0.22, 0.4, 0.09]} castShadow>
            <sphereGeometry args={[0.016, 12, 12]} />
            <meshStandardMaterial color="#1c1c22" roughness={0.3} metalness={0.85} />
          </mesh>
          {/* Lower boom segment reaching the mic */}
          <mesh position={[0.35, 0.34, 0.15]} rotation={[0.35, 0, 0.72]} castShadow>
            <cylinderGeometry args={[0.008, 0.008, 0.3, 10]} />
            <meshStandardMaterial color="#121216" roughness={0.35} metalness={0.8} />
          </mesh>

          {/* Shock mount + capsule */}
          <group position={[0.46, 0.25, 0.2]} rotation={[0.3, 0, 0.22]}>
            <HitBox size={[0.14, 0.2, 0.14]} position={[0, 0.02, 0]} />
            <mesh>
              <torusGeometry args={[0.038, 0.005, 8, 22]} />
              <meshStandardMaterial color="#1a1a1f" roughness={0.35} metalness={0.7} />
            </mesh>
            {/* Elastic suspension */}
            {Array.from({ length: 6 }).map((_, i) => {
              const a = (i / 6) * Math.PI * 2
              return (
                <mesh
                  key={i}
                  position={[Math.cos(a) * 0.028, 0, Math.sin(a) * 0.028]}
                  rotation={[0, -a, Math.PI / 2]}
                >
                  <cylinderGeometry args={[0.0012, 0.0012, 0.024, 5]} />
                  <meshStandardMaterial color="#3a3a44" roughness={0.8} />
                </mesh>
              )
            })}
            {/* Body */}
            <mesh castShadow>
              <cylinderGeometry args={[0.026, 0.024, 0.105, 20]} />
              <meshStandardMaterial color="#2a2a33" roughness={0.3} metalness={0.75} />
            </mesh>
            {/* Grille */}
            <mesh position={[0, 0.05, 0]} castShadow>
              <sphereGeometry args={[0.026, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#3d3d48" roughness={0.45} metalness={0.9} wireframe />
            </mesh>
            <mesh position={[0, 0.048, 0]}>
              <sphereGeometry args={[0.021, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#0b0b0e" roughness={0.9} />
            </mesh>
            {/* Live LED */}
            <mesh position={[0, -0.01, 0.022]}>
              <circleGeometry args={[0.0035, 10]} />
              <meshStandardMaterial
                color="#4ade80"
                emissive="#22c55e"
                emissiveIntensity={3}
                toneMapped={false}
              />
            </mesh>
          </group>
        </group>
      </Hotspot>
    </Movable>
  )
}

/* ─── RING LIGHT ──────────────────────────────────────────────── */
export function RingLight() {
  const { ringLightBoost, toggleRingLight, select } = useRoom()
  const glow = useRef<THREE.MeshStandardMaterial>(null)
  const lamp = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    const target = ringLightBoost ? 1.6 : 1.02
    const breathe = 1 + Math.sin(clock.getElapsedTime() * 1.2) * 0.03
    if (glow.current)
      glow.current.emissiveIntensity = THREE.MathUtils.lerp(
        glow.current.emissiveIntensity,
        target * breathe,
        0.08,
      )
    if (lamp.current)
      lamp.current.intensity = THREE.MathUtils.lerp(
        lamp.current.intensity,
        (ringLightBoost ? 9 : 4.5) * breathe,
        0.08,
      )
  })

  return (
    <Movable id="ringLight">
      <Hotspot
        id="ringLight"
        onSelect={() => {
        toggleRingLight()
        select('ringLight')
        }}
      >
        <group>
          {/* Tripod */}
          {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((a, i) => (
            <mesh
              key={i}
              position={[Math.sin(a) * 0.17, 0.19, Math.cos(a) * 0.17]}
              rotation={[Math.cos(a) * 0.42, -a, -Math.sin(a) * 0.42]}
              castShadow
            >
              <cylinderGeometry args={[0.009, 0.013, 0.42, 8]} />
              <meshStandardMaterial color="#111116" roughness={0.35} metalness={0.8} />
            </mesh>
          ))}
          {/* Column */}
          <mesh position={[0, 0.79, 0]} castShadow>
            <cylinderGeometry args={[0.013, 0.019, 1.22, 12]} />
            <meshStandardMaterial color="#111116" roughness={0.35} metalness={0.8} />
          </mesh>
          {/* Adjustment knob */}
          <mesh position={[0.02, 1.3, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.014, 0.014, 0.02, 12]} />
            <meshStandardMaterial color="#22222a" roughness={0.4} metalness={0.7} />
          </mesh>

          {/* Ring head */}
          <group position={[0, 1.5, 0.02]} rotation={[0.05, -0.5, 0]}>
            <mesh>
              <torusGeometry args={[0.2, 0.023, 18, 52]} />
              <meshStandardMaterial
                ref={glow}
                color="#ffffff"
                emissive="#fff6e8"
                emissiveIntensity={1.02}
                roughness={0.4}
                toneMapped={false}
              />
            </mesh>
            {/* Housing behind the diffuser */}
            <mesh position={[0, 0, -0.018]}>
              <torusGeometry args={[0.2, 0.027, 10, 52]} />
              <meshStandardMaterial color="#0f0f13" roughness={0.4} metalness={0.7} />
            </mesh>
            <pointLight
              ref={lamp}
              position={[0, 0, 0.12]}
              intensity={4.5}
              color="#fff2e0"
              distance={3.4}
              decay={2}
            />
          </group>
        </group>
      </Hotspot>
    </Movable>
  )
}

/* ─── DIGITAL CLOCK ───────────────────────────────────────────── */
export function DigitalClock() {
  const face = useMemo(() => createClockTexture('22:18'), [])

  return (
    <Movable id="clock">
      <Hotspot id="clock">
        <group>
          <HitBox size={[0.3, 0.15, 0.12]} />
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.24, 0.075, 0.05]} />
            <meshStandardMaterial color="#0b0b10" roughness={0.3} metalness={0.55} />
          </mesh>
          {/* Readout */}
          <mesh position={[0, 0.002, 0.026]}>
            <planeGeometry args={[0.2, 0.052]} />
            <meshBasicMaterial map={face} toneMapped={false} />
          </mesh>
          {/* Stand */}
          <mesh position={[0, -0.042, -0.006]}>
            <boxGeometry args={[0.16, 0.012, 0.05]} />
            <meshStandardMaterial color="#111117" roughness={0.4} metalness={0.5} />
          </mesh>
        </group>
      </Hotspot>
    </Movable>
  )
}

/* ─── CACTUS ──────────────────────────────────────────────────── */
export function Cactus() {
  return (
    <Movable id="cactus">
      <Hotspot id="cactus">
        <group>
          <HitBox size={[0.16, 0.34, 0.16]} position={[0, 0.16, 0]} />
          {/* Terracotta pot */}
          <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.052, 0.042, 0.1, 20]} />
            <meshStandardMaterial color="#8a4b32" roughness={0.92} />
          </mesh>
          <mesh position={[0, 0.101, 0]}>
            <cylinderGeometry args={[0.055, 0.052, 0.014, 20]} />
            <meshStandardMaterial color="#9c563a" roughness={0.9} />
          </mesh>
          {/* Soil */}
          <mesh position={[0, 0.105, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 0.008, 20]} />
            <meshStandardMaterial color="#241a14" roughness={1} />
          </mesh>
          {/* Main column */}
          <mesh position={[0, 0.2, 0]} castShadow>
            <capsuleGeometry args={[0.03, 0.16, 6, 14]} />
            <meshStandardMaterial color="#2f7d47" roughness={0.72} />
          </mesh>
          {/* Arms */}
          <mesh position={[0.048, 0.23, 0]} rotation={[0, 0, -0.85]} castShadow>
            <capsuleGeometry args={[0.017, 0.07, 5, 12]} />
            <meshStandardMaterial color="#37904f" roughness={0.72} />
          </mesh>
          <mesh position={[-0.042, 0.19, 0.01]} rotation={[0, 0, 0.8]} castShadow>
            <capsuleGeometry args={[0.015, 0.055, 5, 12]} />
            <meshStandardMaterial color="#37904f" roughness={0.72} />
          </mesh>
        </group>
      </Hotspot>
    </Movable>
  )
}

/* ─── GLASS TERRARIUM ─────────────────────────────────────────── */
export function Terrarium() {
  return (
    <Movable id="plant">
      <Hotspot id="plant">
        <group>
          <HitBox size={[0.18, 0.26, 0.18]} position={[0, 0.12, 0]} />
          {/* Jar */}
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.062, 0.2, 26]} />
            <meshPhysicalMaterial
              color="#dfe9ff"
              roughness={0.06}
              metalness={0}
              transmission={0.94}
              thickness={0.05}
              ior={1.5}
              transparent
              opacity={0.35}
            />
          </mesh>
          {/* Cork lid */}
          <mesh position={[0, 0.208, 0]}>
            <cylinderGeometry args={[0.066, 0.063, 0.024, 26]} />
            <meshStandardMaterial color="#9a6b3c" roughness={0.95} />
          </mesh>
          {/* Substrate */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.06, 0.058, 0.04, 24]} />
            <meshStandardMaterial color="#2a1d12" roughness={1} />
          </mesh>
          {/* Foliage */}
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2
            const r = 0.018 + (i % 3) * 0.012
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * r, 0.06 + (i % 4) * 0.022, Math.sin(a) * r]}
                castShadow
              >
                <sphereGeometry args={[0.019, 8, 6]} />
                <meshStandardMaterial color={i % 2 ? '#2f7d47' : '#46a35c'} roughness={0.75} />
              </mesh>
            )
          })}
        </group>
      </Hotspot>
    </Movable>
  )
}

/* ─── BOOK STACK ──────────────────────────────────────────────── */
export function Books() {
  const spines = ['#2b2b3d', '#1d2b45', '#3a2a4d']

  return (
    <Movable id="books">
      <Hotspot id="books">
        <group>
          <HitBox size={[0.28, 0.15, 0.22]} position={[0, 0.06, 0]} />
          {spines.map((color, i) => (
            <mesh
              key={i}
              position={[i * 0.006, 0.018 + i * 0.032, i * 0.004]}
              rotation={[0, -0.05 * i, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.22 - i * 0.008, 0.03, 0.16 - i * 0.006]} />
              <meshStandardMaterial color={color} roughness={0.88} />
            </mesh>
          ))}
          {/* Page block edge */}
          <mesh position={[0.008, 0.05, 0.004]}>
            <boxGeometry args={[0.206, 0.024, 0.148]} />
            <meshStandardMaterial color="#cfc9bd" roughness={0.95} />
          </mesh>
        </group>
      </Hotspot>
    </Movable>
  )
}

/* ─── DESK SPEAKER ────────────────────────────────────────────── */
export function Speaker() {
  const { audioOn, toggleAudio, select } = useRoom()

  return (
    <Movable id="speaker">
      <Hotspot
        id="speaker"
        onSelect={() => {
        toggleAudio()
        select('speaker')
        }}
      >
        <group>
          <HitBox size={[0.15, 0.12, 0.15]} position={[0, 0.05, 0]} />
          <mesh position={[0, 0.032, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.052, 0.056, 0.064, 26]} />
            <meshStandardMaterial color="#131318" roughness={0.9} metalness={0.08} />
          </mesh>
          <mesh position={[0, 0.066, 0]}>
            <cylinderGeometry args={[0.05, 0.052, 0.006, 26]} />
            <meshStandardMaterial color="#26262e" roughness={0.3} metalness={0.75} />
          </mesh>
          <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.03, 0.045, 30]} />
            <meshStandardMaterial
              color={audioOn ? '#c4b5fd' : '#3d4152'}
              emissive={audioOn ? '#8b5cf6' : '#1b1d26'}
              emissiveIntensity={audioOn ? 3 : 0.3}
              toneMapped={false}
            />
          </mesh>
        </group>
      </Hotspot>
    </Movable>
  )
}

/* ─── ERGONOMIC CHAIR ─────────────────────────────────────────── */
export function Chair() {
  return (
    <Movable id="chair">
      <Hotspot id="chair">
        <group>
          {/* Five-star base */}
          {Array.from({ length: 5 }).map((_, i) => {
            const a = (i / 5) * Math.PI * 2
            return (
              <group key={i}>
                <mesh
                  position={[Math.sin(a) * 0.15, 0.045, Math.cos(a) * 0.15]}
                  rotation={[Math.cos(a) * 0.06, -a, Math.PI / 2]}
                  castShadow
                >
                  <cylinderGeometry args={[0.016, 0.022, 0.3, 8]} />
                  <meshStandardMaterial color="#131318" roughness={0.4} metalness={0.75} />
                </mesh>
                <mesh position={[Math.sin(a) * 0.3, 0.028, Math.cos(a) * 0.3]} castShadow>
                  <cylinderGeometry args={[0.028, 0.028, 0.032, 14]} />
                  <meshStandardMaterial color="#0d0d11" roughness={0.55} metalness={0.4} />
                </mesh>
              </group>
            )
          })}

          {/* Gas lift */}
          <mesh position={[0, 0.26, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.042, 0.4, 14]} />
            <meshStandardMaterial color="#1a1a20" roughness={0.35} metalness={0.8} />
          </mesh>

          {/* Seat */}
          <mesh position={[0, 0.47, 0.015]} castShadow receiveShadow>
            <boxGeometry args={[0.5, 0.085, 0.48]} />
            <meshStandardMaterial color="#1e1e27" roughness={0.62} metalness={0.12} />
          </mesh>
          {/* Seat bolsters */}
          {([-0.22, 0.22] as const).map((x) => (
            <mesh key={x} position={[x, 0.5, 0.015]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <capsuleGeometry args={[0.036, 0.4, 5, 12]} />
              <meshStandardMaterial color="#26262f" roughness={0.7} metalness={0.1} />
            </mesh>
          ))}

          {/* Backrest, reclined */}
          <group position={[0, 0.52, -0.22]} rotation={[0.14, 0, 0]}>
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.46, 0.62, 0.07]} />
              <meshStandardMaterial color="#1e1e27" roughness={0.62} metalness={0.12} />
            </mesh>
            {/* Padded side wings */}
            {([-0.2, 0.2] as const).map((x) => (
              <mesh key={x} position={[x, 0.3, 0.035]} rotation={[0, 0, 0]} castShadow>
                <capsuleGeometry args={[0.038, 0.5, 5, 12]} />
                <meshStandardMaterial color="#26262f" roughness={0.7} metalness={0.1} />
              </mesh>
            ))}
            {/* Centre seam and horizontal quilting */}
            <mesh position={[0, 0.3, 0.037]}>
              <boxGeometry args={[0.012, 0.58, 0.006]} />
              <meshStandardMaterial color="#0d0d12" roughness={0.9} />
            </mesh>
            {[0.06, 0.2, 0.34, 0.48].map((y) => (
              <mesh key={y} position={[0, y, 0.037]}>
                <boxGeometry args={[0.3, 0.008, 0.006]} />
                <meshStandardMaterial color="#0d0d12" roughness={0.9} />
              </mesh>
            ))}

            {/* Tapered racing shoulder */}
            <mesh position={[0, 0.6, 0.005]} castShadow>
              <boxGeometry args={[0.34, 0.09, 0.075]} />
              <meshStandardMaterial color="#1e1e27" roughness={0.62} metalness={0.12} />
            </mesh>

            {/* Headrest post, so the headrest reads as separate */}
            <mesh position={[0, 0.68, -0.005]}>
              <boxGeometry args={[0.05, 0.09, 0.04]} />
              <meshStandardMaterial color="#15151b" roughness={0.5} metalness={0.4} />
            </mesh>

            {/* Lumbar cushion */}
            <mesh position={[0, 0.08, 0.05]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <capsuleGeometry args={[0.045, 0.26, 5, 12]} />
              <meshStandardMaterial color="#1b1b24" roughness={0.85} />
            </mesh>
            {/* Headrest */}
            <mesh position={[0, 0.76, 0.02]} rotation={[0.12, 0, 0]} castShadow>
              <boxGeometry args={[0.26, 0.13, 0.075]} />
              <meshStandardMaterial color="#22222b" roughness={0.66} metalness={0.1} />
            </mesh>
          </group>

          {/* Armrests */}
          {([-0.28, 0.28] as const).map((x) => (
            <group key={x}>
              <mesh position={[x, 0.55, -0.04]} castShadow>
                <boxGeometry args={[0.035, 0.11, 0.05]} />
                <meshStandardMaterial color="#1a1a20" roughness={0.4} metalness={0.6} />
              </mesh>
              <mesh position={[x, 0.615, -0.02]} castShadow>
                <boxGeometry args={[0.062, 0.024, 0.21]} />
                <meshStandardMaterial color="#101015" roughness={0.85} />
              </mesh>
            </group>
          ))}
        </group>
      </Hotspot>
    </Movable>
  )
}
