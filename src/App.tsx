import { Suspense, lazy } from 'react'
import { WorldProvider, useWorld } from '@/state/WorldContext'
import { useControls } from '@/hooks/useControls'
import { Boot } from '@/components/ui/Boot'
import { Hud } from '@/components/ui/Hud'
import { Joystick } from '@/components/ui/Joystick'
import { Cursor } from '@/components/ui/Cursor'
import { ZonePanel } from '@/components/ui/Panels'
import { ProjectPanel } from '@/components/ui/ProjectPanel'
import { Fallback } from '@/components/ui/Fallback'
import '@/styles/ui.css'

/**
 * The station is the only thing that pulls three.js, so it stays behind a
 * dynamic import: the boot screen, the copy and the accessible document are
 * all interactive before the renderer has been fetched, and a device that
 * cannot get a context never downloads it at all.
 */
const SpaceScene = lazy(() =>
  import('@/components/world/SpaceScene').then((m) => ({ default: m.SpaceScene })),
)

function Experience() {
  const { hasWebGL, stage } = useWorld()
  useControls()

  /* No context, no world — but never a blank page. */
  if (!hasWebGL) return <Fallback visible />

  return (
    <>
      <Suspense fallback={null}>
        <SpaceScene />
      </Suspense>

      <Boot />
      <Hud />
      <Joystick />
      <ZonePanel />
      <ProjectPanel />
      <Cursor />

      {/* Present for crawlers and assistive technology even while the world
          is running, so the content is never locked inside the canvas. */}
      <Fallback visible={false} />

      {stage === 'entered' && (
        <a className="skip-link" href="#doc-projects">
          Skip to the written portfolio
        </a>
      )}
    </>
  )
}

export default function App() {
  return (
    <WorldProvider>
      <Experience />
    </WorldProvider>
  )
}
