import { Html } from '@react-three/drei'
import { useContextBridge } from 'its-fine'
import { MONITOR } from '@/lib/layout'
import { useRoom } from '@/state/RoomContext'
import { VirtualComputer } from '@/components/ui/computer/VirtualComputer'
import { Hotspot } from './Hotspot'

/**
 * Pixel size of the virtual display. Mapped onto the physical panel via
 * drei's transform ratio: worldSize = px * (distanceFactor / 400).
 */
const SCREEN_PX = { width: 1440, height: 686 }
const DISTANCE_FACTOR = (MONITOR.screenWidth / SCREEN_PX.width) * 400

export function MonitorScreen() {
  const { view, enterComputer } = useRoom()
  const live = view === 'computer'

  return (
    <group>
      <LiveScreen live={live} />

      {/* Invisible click target that sits the visitor down at the machine.
          Disabled once they are there so the DOM below receives the clicks. */}
      {!live && (
        <Hotspot id="monitor" onSelect={enterComputer}>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[MONITOR.screenWidth, MONITOR.screenHeight]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </Hotspot>
      )}
    </group>
  )
}

/** The real machine — DOM rendered in 3D space. */
function LiveScreen({ live }: { live: boolean }) {
  /* drei's <Html> portals into the DOM, which drops the React context
     the canvas tree is running under. Carry it across explicitly. */
  const Bridge = useContextBridge()

  return (
    <Html
      transform
      distanceFactor={DISTANCE_FACTOR}
      position={[0, 0, 0.004]}
      zIndexRange={[10, 0]}
      /* drei's own wrapper defaults to 'auto' and would swallow every
         pointer event over the panel, including the raycast that sits
         the visitor down at the desk. */
      pointerEvents={live ? 'auto' : 'none'}
      style={{
        width: SCREEN_PX.width,
        height: SCREEN_PX.height,
        pointerEvents: live ? 'auto' : 'none',
        userSelect: live ? 'auto' : 'none',
      }}
    >
      <div className={`vm-shell${live ? ' is-live' : ''}`}>
        <Bridge>
          <VirtualComputer />
        </Bridge>
        <div className="vm-glass" aria-hidden />
      </div>
    </Html>
  )
}
