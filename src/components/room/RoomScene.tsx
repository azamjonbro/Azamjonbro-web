import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, Preload, useProgress } from '@react-three/drei'
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  N8AO,
  Outline,
  Selection,
  SMAA,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { CAMERA, monitorPanelWorld } from '@/lib/layout'
import { useRoom } from '@/state/RoomContext'
import { CameraRig } from './CameraRig'
import { Shell } from './Shell'
import { Desk } from './Desk'
import { Lighting, DustMotes } from './Lighting'
import { MonitorArm, MonitorBody, MacBook, Keyboard, Mouse, Headphones, Microphone, RingLight, DigitalClock, Cactus, Terrarium, Books, Speaker, Chair } from './Props'
import { MonitorScreen } from './MonitorScreen'
import { Movable } from './Movable'
import { WallDisplays } from './WallDisplays'

/** Feeds real asset progress into the loading screen. */
function LoadProgress() {
  const { progress, active } = useProgress()
  const { setProgress, finishLoading, loading } = useRoom()

  useEffect(() => {
    setProgress(Math.max(8, progress))
  }, [progress, setProgress])

  useEffect(() => {
    if (!loading || active) return
    const timer = setTimeout(finishLoading, 500)
    return () => clearTimeout(timer)
  }, [active, loading, finishLoading])

  /* Nothing in the room is worth a permanent loading screen. */
  useEffect(() => {
    if (!loading) return
    const bail = setTimeout(finishLoading, 8000)
    return () => clearTimeout(bail)
  }, [loading, finishLoading])

  return null
}

/**
 * Image-based lighting built in-scene rather than fetched from a CDN,
 * so the metals and glass have something to reflect offline.
 * Baked once — `frames={1}` keeps it off the render loop.
 */
function RoomEnvironment() {
  return (
    <Environment resolution={128} frames={1} environmentIntensity={0.45}>
      <color attach="background" args={['#05050a']} />

      {/* Monitor glow, the dominant reflection on the desk */}
      <Lightformer
        form="rect"
        intensity={2.6}
        color="#8b7bff"
        scale={[3, 1.6, 1]}
        position={[0, 0.4, -2.4]}
        rotation={[0, 0, 0]}
      />
      {/* Warm key from above front-right */}
      <Lightformer
        form="rect"
        intensity={1.8}
        color="#ffd9a8"
        scale={[2.4, 2.4, 1]}
        position={[2.6, 2.2, 1.6]}
        rotation={[0, -Math.PI / 3, 0]}
      />
      {/* Cool city light through the window */}
      <Lightformer
        form="rect"
        intensity={2.2}
        color="#3f6fd0"
        scale={[2, 2.6, 1]}
        position={[3, 1.4, -0.4]}
        rotation={[0, -Math.PI / 2, 0]}
      />
      {/* Soft ceiling bounce */}
      <Lightformer
        form="rect"
        intensity={0.6}
        color="#5a5f80"
        scale={[5, 5, 1]}
        position={[0, 4, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </Environment>
  )
}

function RoomContents() {
  return (
    <>
      <Lighting />
      <Shell />
      <Desk />

      <Movable id="monitor">
        <MonitorArm />
        <MonitorBody />
        <MonitorScreen />
      </Movable>

      <MacBook />
      <Keyboard />
      <Mouse />
      <Headphones />
      <Microphone />
      <Speaker />
      <Terrarium />
      <Cactus />
      <Books />
      <DigitalClock />
      <RingLight />
      <Chair />

      <WallDisplays />

      <ContactShadows
        position={[0.2, 0.008, -0.6]}
        opacity={0.55}
        scale={5}
        blur={2.4}
        far={2}
        resolution={512}
        color="#000000"
      />

      <DustMotes />
      <RoomEnvironment />
    </>
  )
}

/** Focus sits on the desk surface, so the desk and screen stay crisp. */
const DOF_TARGET: [number, number, number] = [0.2, 1.0, -1.2]

function Effects() {
  const { isMobile, view, layout } = useRoom()
  const focus = monitorPanelWorld(layout.monitor).position

  if (isMobile) {
    return (
      <EffectComposer>
        <Bloom luminanceThreshold={1.1} luminanceSmoothing={0.25} intensity={0.3} mipmapBlur />
        <Vignette offset={0.32} darkness={0.5} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer multisampling={0} enableNormalPass>
      <N8AO aoRadius={0.45} intensity={1.8} distanceFalloff={0.6} color="#04040a" halfRes />
      <Outline
        visibleEdgeColor={0xa78bfa}
        hiddenEdgeColor={0x5b21b6}
        edgeStrength={4.5}
        blur
        xRay={false}
        width={1400}
      />
      <Bloom luminanceThreshold={1.1} luminanceSmoothing={0.3} intensity={0.32} mipmapBlur radius={0.6} />
      <DepthOfField
        target={view === 'computer' ? focus : DOF_TARGET}
        bokehScale={view === 'computer' ? 1.4 : 2.4}
        worldFocusRange={view === 'computer' ? 0.6 : 2.6}
      />
      <Vignette offset={0.28} darkness={0.55} blendFunction={BlendFunction.NORMAL} />
      <SMAA />
    </EffectComposer>
  )
}

export function RoomScene() {
  const { isMobile, select } = useRoom()

  return (
    <div className="room-canvas">
      <Canvas
        shadows={isMobile ? false : 'soft'}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        camera={{
          position: CAMERA.room.position.toArray(),
          fov: CAMERA.room.fov,
          near: 0.05,
          far: 40,
        }}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.14
        }}
        /* R3F listens on the canvas' parent, so clicks inside the monitor's
           DOM also land here. Only a genuine miss on the canvas closes the panel. */
        onPointerMissed={(e) => {
          if ((e.target as HTMLElement | null)?.tagName === 'CANVAS') select(null)
        }}
      >
        <color attach="background" args={['#06060b']} />
        <fog attach="fog" args={['#06060b', 4, 12]} />

        <CameraRig />

        <Suspense fallback={null}>
          <Selection>
            <RoomContents />
            {!new URLSearchParams(location.search).has('nofx') && <Effects />}
          </Selection>
          <Preload all />
        </Suspense>

        <LoadProgress />
      </Canvas>
    </div>
  )
}
