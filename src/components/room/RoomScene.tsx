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
    const timer = setTimeout(finishLoading, 350)
    return () => clearTimeout(timer)
  }, [active, loading, finishLoading])

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
  const { isTouch } = useRoom()

  return (
    <>
      <Lighting />
      <Shell />
      <Desk />

      <Movable id="monitor">
        <MonitorArm />
        <MonitorBody />
        {/* A real DOM tree rendered in 3D is the most expensive thing in the
            room and needs a cursor to be worth anything. Touch gets the panel
            without the machine behind it. */}
        {!isTouch && <MonitorScreen />}
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
  const { isMobile, isTouch, view, layout } = useRoom()
  const focus = monitorPanelWorld(layout.monitor).position

  /* Phones pay for the room's identity, not for its polish: a vignette and
     a whisper of bloom keep the palette, and the passes that cost a full
     depth prepass — ambient occlusion, depth of field, the outline — are
     the ones a mobile GPU cannot afford at 60fps. */
  if (isMobile || isTouch) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={1.15} luminanceSmoothing={0.25} intensity={0.26} mipmapBlur />
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
  /* Pointer events are switched off in CSS on `.room-layer` once the hero is
     behind us, which is also what stops R3F raycasting the scene per move. */
  const { isMobile, isTouch, select } = useRoom()
  const lightweight = isMobile || isTouch

  return (
    <div className="room-canvas">
      <Canvas
        /* 'soft' maps to PCFSoftShadowMap, which three deprecated in r185
           and now warns about on every boot. PCF is the supported filter. */
        shadows={lightweight ? false : 'percentage'}
        dpr={lightweight ? [1, 1.5] : [1, 2]}
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
