import { RoomScene } from '@/components/room/RoomScene'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { Tooltip } from '@/components/ui/Tooltip'
import { InfoPanel } from '@/components/ui/InfoPanel'
import { Hint } from '@/components/ui/Hint'
import { RoomHud } from '@/components/ui/RoomHud'
import { useCameraInteraction } from '@/hooks/useCameraInteraction'

/**
 * The 3D room and everything that only makes sense alongside it.
 *
 * Isolated behind a default export so App can reach it through a dynamic
 * import: this is the only module that pulls three.js, and phones must
 * never download it.
 */
export default function DesktopRoom() {
  useCameraInteraction()

  return (
    <>
      <RoomScene />

      <RoomHud />
      <Tooltip />
      <InfoPanel />
      <Hint />
      <LoadingScreen />
    </>
  )
}
