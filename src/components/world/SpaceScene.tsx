import { Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload, useProgress } from '@react-three/drei'
import { Bloom, EffectComposer, N8AO, SMAA, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { zones } from '@/data/zones'
import { useWorld } from '@/state/WorldContext'
import { CameraRig } from './CameraRig'
import { Cosmos } from './Cosmos'
import { Station } from './Station'
import { Player } from './Player'
import { ProjectBay } from './ProjectBay'
import { ZoneMarker } from './ZoneMarker'
import { Dust } from './Dust'
import {
  AboutCore,
  ContactUplink,
  LabModule,
  MissionPillars,
  ProcessRing,
  SkillConstellation,
} from './Structures'

/** Feeds real load progress into the boot screen. */
function LoadReporter() {
  const { progress, active } = useProgress()
  const { setProgress, markReady, stage } = useWorld()

  useEffect(() => {
    setProgress(Math.max(10, progress))
  }, [progress, setProgress])

  useEffect(() => {
    if (stage !== 'booting' || active) return
    const timer = setTimeout(markReady, 300)
    return () => clearTimeout(timer)
  }, [active, stage, markReady])

  return null
}

/**
 * Lighting.
 *
 * Space has one source, so the station is lit by one key plus the light its
 * own fixtures throw. Resisting the urge to add fill from every direction is
 * most of what keeps it from looking like a lit studio model.
 */
function Lighting() {
  const { quality } = useWorld()

  return (
    <>
      {/* The star, far off-axis so the station has a clear lit and dark side. */}
      <directionalLight
        position={[60, 48, 34]}
        intensity={2.5}
        color="#dce9ff"
        castShadow={quality.shadows}
        shadow-mapSize={quality.tier === 'high' ? [2048, 2048] : [1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-camera-left={-52}
        shadow-camera-right={52}
        shadow-camera-top={52}
        shadow-camera-bottom={-52}
        shadow-bias={-0.0006}
        shadow-normalBias={0.04}
      />

      {/* Planetshine: cool, weak, and from the opposite side. */}
      <hemisphereLight args={['#2a3d5c', '#05070c', 0.5]} />
      <ambientLight intensity={0.16} color="#1a2536" />
    </>
  )
}

function Effects() {
  const { quality } = useWorld()

  if (!quality.heavyEffects) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.72} luminanceSmoothing={0.3} intensity={0.55} mipmapBlur />
        <Vignette offset={0.3} darkness={0.62} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer multisampling={0} enableNormalPass>
      <N8AO aoRadius={3.2} intensity={1.5} distanceFalloff={0.8} color="#03050a" halfRes />
      <Bloom luminanceThreshold={0.62} luminanceSmoothing={0.32} intensity={0.7} mipmapBlur radius={0.72} />
      <Vignette offset={0.28} darkness={0.6} blendFunction={BlendFunction.NORMAL} />
      <SMAA />
    </EffectComposer>
  )
}

function World() {
  /* The camera writes its yaw here and the player reads it, so movement is
     camera-relative without either of them re-rendering the other. */
  const cameraYaw = useRef(0)

  return (
    <>
      <CameraRig yawOut={cameraYaw} />
      <Lighting />
      <Cosmos />

      <Station />
      <Player cameraYaw={cameraYaw} />

      {zones.map((zone) => (
        <ZoneMarker key={zone.id} zone={zone} />
      ))}

      <AboutCore />
      <ProjectBay />
      <SkillConstellation />
      <MissionPillars />
      <ProcessRing />
      <LabModule />
      <ContactUplink />

      <Dust />
    </>
  )
}

export function SpaceScene() {
  const { quality } = useWorld()
  const noFx = typeof location !== 'undefined' && new URLSearchParams(location.search).has('nofx')

  return (
    <div className="world-canvas">
      <Canvas
        shadows={quality.shadows ? 'percentage' : false}
        dpr={quality.dpr}
        camera={{ position: [0, 26, 46], fov: 52, near: 0.5, far: 2600 }}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
        }}
      >
        <color attach="background" args={['#04050a']} />
        <fog attach="fog" args={['#04050a', 70, 240]} />

        <Suspense fallback={null}>
          <World />
          {!noFx && <Effects />}
          <Preload all />
        </Suspense>

        <LoadReporter />
      </Canvas>
    </div>
  )
}
