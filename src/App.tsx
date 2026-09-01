import { Suspense, lazy } from 'react'
import { FiberProvider } from 'its-fine'
import { RoomProvider, useRoom } from '@/state/RoomContext'
import { MobileLanding } from '@/components/mobile/MobileLanding'
import { ResumeViewer } from '@/components/ui/ResumeViewer'

/** Split so the three.js bundle is only fetched by clients that render it. */
const DesktopRoom = lazy(() => import('@/components/DesktopRoom'))

function Site() {
  const { isMobile } = useRoom()

  /* Phones get a plain portfolio page on the room's palette — no canvas,
     no WebGL, no 1.5 MB of renderer. The resume is shared by both. */
  if (isMobile) {
    return (
      <>
        <MobileLanding />
        <ResumeViewer />
      </>
    )
  }

  return (
    <>
      <Suspense fallback={null}>
        <DesktopRoom />
      </Suspense>
      <ResumeViewer />
    </>
  )
}

export default function App() {
  return (
    <FiberProvider>
      <RoomProvider>
        <Site />
      </RoomProvider>
    </FiberProvider>
  )
}
