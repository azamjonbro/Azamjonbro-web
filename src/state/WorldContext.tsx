import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ZoneId } from '@/data/zones'
import { HOME, type PlanetId } from '@/data/planets'
import { detectQuality, webglAvailable, type Quality } from '@/lib/perf'
import { releaseControls } from '@/lib/input'
import { uiSounds } from '@/lib/uiSounds'
import { ambientAudio } from '@/lib/ambientAudio'

/** Where the visitor is in the experience, not where they are in the world. */
export type Stage = 'booting' | 'ready' | 'entered'

/**
 * A trip between worlds.
 *
 *   idle      standing on a surface
 *   leaving   over the edge and climbing away from it
 *   landing   falling toward somewhere new
 */
export type Travel = 'idle' | 'leaving' | 'landing'

interface WorldValue {
  stage: Stage
  progress: number
  setProgress: (n: number) => void
  markReady: () => void
  enter: () => void

  /** The zone the player is standing inside, if any. */
  nearZone: ZoneId | null
  setNearZone: (id: ZoneId | null) => void

  /** The zone whose panel is open. The camera flies to it and the world dims. */
  openZone: ZoneId | null
  openPanel: (id: ZoneId) => void
  closePanel: () => void

  /** Exhibit selected inside the projects bay. */
  nearProject: string | null
  setNearProject: (id: string | null) => void
  openProject: string | null
  showProject: (id: string) => void
  closeProject: () => void

  /** The surface under the player's feet. */
  planet: PlanetId
  travel: Travel
  /** Called by the avatar the moment it clears the edge. */
  leaveOrbit: () => void
  /** Swaps the world under the falling avatar. */
  landOn: (id: PlanetId) => void
  /** Touchdown: hands the controls back. */
  settle: () => void

  /** True while any overlay owns the input. */
  blocked: boolean

  /** Retires the controls hint the first time the player moves. */
  hintSeen: boolean
  retireHint: () => void

  audioOn: boolean
  toggleAudio: () => void

  quality: Quality
  hasWebGL: boolean
  isTouch: boolean
  reducedMotion: boolean
}

const WorldContext = createContext<WorldValue | null>(null)

export function WorldProvider({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<Stage>('booting')
  const [progress, setProgress] = useState(0)
  const [nearZone, setNearZone] = useState<ZoneId | null>(null)
  const [openZone, setOpenZone] = useState<ZoneId | null>(null)
  const [nearProject, setNearProject] = useState<string | null>(null)
  const [openProject, setOpenProject] = useState<string | null>(null)
  const [hintSeen, setHintSeen] = useState(false)
  const [audioOn, setAudioOn] = useState(false)
  const [planet, setPlanet] = useState<PlanetId>(HOME)
  const [travel, setTravel] = useState<Travel>('idle')

  const [quality] = useState<Quality>(detectQuality)
  const [hasWebGL] = useState(webglAvailable)
  const [isTouch, setIsTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches,
  )
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const touch = window.matchMedia('(hover: none)')
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onTouch = () => setIsTouch(touch.matches)
    const onMotion = () => setReducedMotion(motion.matches)
    touch.addEventListener('change', onTouch)
    motion.addEventListener('change', onMotion)
    return () => {
      touch.removeEventListener('change', onTouch)
      motion.removeEventListener('change', onMotion)
    }
  }, [])

  const markReady = useCallback(() => {
    setProgress(100)
    setStage((s) => (s === 'booting' ? 'ready' : s))
  }, [])

  /* The scene is built from procedural geometry, so there is little to wait
     on — but a device that never gets a context would otherwise sit on the
     boot screen forever. This timer is owned by the page, not the canvas. */
  useEffect(() => {
    const bail = setTimeout(markReady, 4000)
    return () => clearTimeout(bail)
  }, [markReady])

  const enter = useCallback(() => {
    uiSounds.click()
    setStage('entered')
  }, [])

  const openPanel = useCallback((id: ZoneId) => {
    uiSounds.click()
    releaseControls()
    setOpenZone(id)
  }, [])

  const closePanel = useCallback(() => {
    setOpenZone(null)
    setOpenProject(null)
  }, [])

  const showProject = useCallback((id: string) => {
    uiSounds.click()
    releaseControls()
    setOpenProject(id)
  }, [])

  const closeProject = useCallback(() => setOpenProject(null), [])

  const leaveOrbit = useCallback(() => {
    uiSounds.launch()
    setTravel('leaving')
    /* Nothing on the old world is near you any more, and a prompt left
       standing while you fall away from it is the kind of detail that makes
       the whole trip feel unfinished. */
    setNearZone(null)
    setNearProject(null)
  }, [])

  const landOn = useCallback((id: PlanetId) => {
    setPlanet(id)
    setTravel('landing')
  }, [])

  /* Touchdown. The sound belongs to the avatar hitting the ground, not to
     the state change, so it is played where the impact is measured. */
  const settle = useCallback(() => setTravel('idle'), [])

  const retireHint = useCallback(() => setHintSeen(true), [])

  const toggleAudio = useCallback(() => setAudioOn(ambientAudio.toggle()), [])


  /* The flight is a cutscene: input is released for its length, which is
     also what stops the avatar from trying to walk in mid-air. */
  const blocked =
    stage !== 'entered' || openZone !== null || openProject !== null || travel !== 'idle'

  /* Escape unwinds one layer at a time, innermost first. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (openProject) setOpenProject(null)
      else if (openZone) setOpenZone(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openZone, openProject])

  /* Controls must not stay held underneath an overlay. */
  useEffect(() => {
    if (blocked) releaseControls()
  }, [blocked])

  const value = useMemo<WorldValue>(
    () => ({
      stage,
      progress,
      setProgress,
      markReady,
      enter,
      nearZone,
      setNearZone,
      openZone,
      openPanel,
      closePanel,
      nearProject,
      setNearProject,
      openProject,
      showProject,
      closeProject,
      planet,
      travel,
      leaveOrbit,
      landOn,
      settle,
      blocked,
      hintSeen,
      retireHint,
      audioOn,
      toggleAudio,
      quality,
      hasWebGL,
      isTouch,
      reducedMotion,
    }),
    [
      stage, progress, markReady, enter,
      nearZone, openZone, openPanel, closePanel,
      nearProject, openProject, showProject, closeProject,
      planet, travel, leaveOrbit, landOn, settle,
      blocked, hintSeen, retireHint,
      audioOn, toggleAudio,
      quality, hasWebGL, isTouch, reducedMotion,
    ],
  )

  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>
}

export function useWorld() {
  const ctx = useContext(WorldContext)
  if (!ctx) throw new Error('useWorld must be used inside <WorldProvider>')
  return ctx
}
