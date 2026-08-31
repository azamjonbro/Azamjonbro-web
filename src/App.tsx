import { Suspense, lazy } from 'react'
import { FiberProvider } from 'its-fine'
import { RoomProvider } from '@/state/RoomContext'
import { useCameraInteraction } from '@/hooks/useCameraInteraction'
import { Nav } from '@/components/site/Nav'
import { Hero } from '@/components/site/Hero'
import { Projects } from '@/components/site/Projects'
import { About } from '@/components/site/About'
import { Skills } from '@/components/site/Skills'
import { Experience } from '@/components/site/Experience'
import { Process } from '@/components/site/Process'
import { Capabilities } from '@/components/site/Capabilities'
import { Contact } from '@/components/site/Contact'
import { CaseStudy } from '@/components/site/CaseStudy'
import { Scrim } from '@/components/site/Scrim'
import { ResumeViewer } from '@/components/ui/ResumeViewer'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import '@/styles/site.css'

/**
 * The room is the only thing that pulls three.js, so it stays behind a
 * dynamic import: the page's type, layout and content are interactive
 * before the renderer has been fetched, and a device that fails to get a
 * WebGL context still gets the whole site.
 */
const RoomLayer = lazy(() => import('@/components/RoomLayer'))

function Site() {
  useCameraInteraction()

  return (
    <>
      <Suspense fallback={null}>
        <RoomLayer />
      </Suspense>
      <Scrim />

      <Nav />

      <main className="page" id="main">
        <Hero />
        <Projects />
        <About />
        <Skills />
        <Experience />
        <Process />
        <Capabilities />
        <Contact />
      </main>

      <CaseStudy />
      <ResumeViewer />
      <LoadingScreen />
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
