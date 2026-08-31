import { RoomScene } from '@/components/room/RoomScene'
import { Tooltip } from '@/components/ui/Tooltip'
import { InfoPanel } from '@/components/ui/InfoPanel'
import { Hint } from '@/components/ui/Hint'
import { useRoom } from '@/state/RoomContext'

/**
 * The 3D room and the chrome that only makes sense alongside it.
 *
 * Isolated behind a default export so App can reach it through a dynamic
 * import: this is the only module that pulls three.js.
 *
 * The room sits behind the whole page rather than under the hero alone, so
 * the camera can keep moving through it as the visitor reads. It only takes
 * the pointer while the hero owns the viewport — below that, every click
 * belongs to the page.
 */
export default function RoomLayer() {
  const { roomLive } = useRoom()

  return (
    <div className={`room-layer${roomLive ? ' is-live' : ''}`}>
      <RoomScene />

      <Tooltip />
      <InfoPanel />
      <Hint />
    </div>
  )
}
