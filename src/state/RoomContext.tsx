import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { interactiveObjects, type InteractiveObject, type ObjectId } from '@/data/interactiveObjects'
import {
  cloneDefaults,
  movableIds,
  type MovableId,
  type Placement,
  type Vec3,
} from '@/data/placements'
import { ambientAudio } from '@/lib/ambientAudio'
import { uiSounds } from '@/lib/uiSounds'

/** Where the camera is currently parked. */
export type ViewMode = 'room' | 'computer'

interface RoomContextValue {
  loading: boolean
  progress: number
  setProgress: (n: number) => void
  finishLoading: () => void

  hovered: InteractiveObject | null
  hover: (id: ObjectId | null) => void

  selected: InteractiveObject | null
  select: (id: ObjectId | null) => void

  view: ViewMode
  enterComputer: () => void
  exitComputer: () => void

  /** The resume sheet, opened by clicking the MacBook. */
  resumeOpen: boolean
  openResume: () => void
  closeResume: () => void

  /** Objects the visitor has already clicked — drives the discovery counter. */
  discovered: ObjectId[]

  audioOn: boolean
  toggleAudio: () => void

  ringLightBoost: boolean
  toggleRingLight: () => void

  isMobile: boolean
  reducedMotion: boolean

  /* ─── LAYOUT EDITOR ─── */
  /** Rearrange mode: props can be dragged and rotated instead of inspected. */
  editMode: boolean
  toggleEditMode: () => void
  /** Which object the editor is currently acting on. */
  editing: MovableId | null
  setEditing: (id: MovableId | null) => void
  /** True while a drag is in flight, so the camera holds still. */
  dragging: boolean
  setDragging: (v: boolean) => void
  layout: Record<MovableId, Placement>
  setPlacement: (id: MovableId, next: { position?: Vec3; rotation?: Vec3 }) => void
  nudge: (id: MovableId, axis: 0 | 1 | 2, delta: number) => void
  rotate: (id: MovableId, delta: number) => void
  resetPlacement: (id: MovableId) => void
  resetLayout: () => void
}

const LAYOUT_KEY = 'azamjonbro.room-layout.v1'

/** Keeps stored coordinates readable instead of accumulating float noise. */
const round = (v: number) => Math.round(v * 10000) / 10000

/** Restores a saved layout, ignoring anything that no longer matches the schema. */
function loadLayout(): Record<MovableId, Placement> {
  const base = cloneDefaults()
  if (typeof window === 'undefined') return base

  try {
    const raw = window.localStorage.getItem(LAYOUT_KEY)
    if (!raw) return base
    const saved = JSON.parse(raw) as Partial<Record<MovableId, Partial<Placement>>>

    for (const id of movableIds) {
      const entry = saved[id]
      if (!entry) continue
      if (Array.isArray(entry.position) && entry.position.length === 3) {
        base[id].position = entry.position.map(Number) as Vec3
      }
      if (Array.isArray(entry.rotation) && entry.rotation.length === 3) {
        base[id].rotation = entry.rotation.map(Number) as Vec3
      }
    }
  } catch {
    /* A corrupt layout is not worth a broken room. */
  }

  return base
}

const RoomContext = createContext<RoomContextValue | null>(null)

export function RoomProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [hoveredId, setHoveredId] = useState<ObjectId | null>(null)
  const [selectedId, setSelectedId] = useState<ObjectId | null>(null)
  const [view, setView] = useState<ViewMode>('room')
  const [resumeOpen, setResumeOpen] = useState(false)
  const [discovered, setDiscovered] = useState<ObjectId[]>([])
  const [audioOn, setAudioOn] = useState(false)
  const [ringLightBoost, setRingLightBoost] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editing, setEditing] = useState<MovableId | null>(null)
  const [dragging, setDragging] = useState(false)
  const [layout, setLayout] = useState<Record<MovableId, Placement>>(loadLayout)
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 900,
  )
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', onResize)

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotion = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onMotion)

    return () => {
      window.removeEventListener('resize', onResize)
      mq.removeEventListener('change', onMotion)
    }
  }, [])

  const hover = useCallback((id: ObjectId | null) => setHoveredId(id), [])

  const select = useCallback((id: ObjectId | null) => {
    setSelectedId(id)
    if (!id) return
    uiSounds.click()
    setDiscovered((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  const enterComputer = useCallback(() => {
    uiSounds.click()
    setSelectedId(null)
    setView('computer')
    setDiscovered((prev) => (prev.includes('monitor') ? prev : [...prev, 'monitor']))
  }, [])

  const exitComputer = useCallback(() => setView('room'), [])

  const openResume = useCallback(() => {
    uiSounds.click()
    setSelectedId(null)
    setResumeOpen(true)
    setDiscovered((prev) => (prev.includes('macbook') ? prev : [...prev, 'macbook']))
  }, [])

  const closeResume = useCallback(() => setResumeOpen(false), [])

  const finishLoading = useCallback(() => {
    setProgress(100)
    setLoading(false)
  }, [])

  const toggleAudio = useCallback(() => {
    setAudioOn(ambientAudio.toggle())
  }, [])
  const toggleRingLight = useCallback(() => setRingLightBoost((v) => !v), [])

  /* ─── LAYOUT EDITOR ─── */

  const setPlacement = useCallback((id: MovableId, next: { position?: Vec3; rotation?: Vec3 }) => {
    setLayout((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        position: next.position ?? prev[id].position,
        rotation: next.rotation ?? prev[id].rotation,
      },
    }))
  }, [])

  const nudge = useCallback((id: MovableId, axis: 0 | 1 | 2, delta: number) => {
    setLayout((prev) => {
      const position = [...prev[id].position] as Vec3
      position[axis] = round(position[axis] + delta)
      return { ...prev, [id]: { ...prev[id], position } }
    })
  }, [])

  const rotate = useCallback((id: MovableId, delta: number) => {
    setLayout((prev) => {
      const rotation = [...prev[id].rotation] as Vec3
      rotation[1] = round(rotation[1] + delta)
      return { ...prev, [id]: { ...prev[id], rotation } }
    })
  }, [])

  const resetPlacement = useCallback((id: MovableId) => {
    const defaults = cloneDefaults()
    setLayout((prev) => ({ ...prev, [id]: defaults[id] }))
  }, [])

  const resetLayout = useCallback(() => setLayout(cloneDefaults()), [])

  /* One writer, so every mutation above stays a plain state update.
     The room should look the same after a reload. */
  useEffect(() => {
    try {
      const slim = Object.fromEntries(
        movableIds.map((id) => [id, { position: layout[id].position, rotation: layout[id].rotation }]),
      )
      window.localStorage.setItem(LAYOUT_KEY, JSON.stringify(slim))
    } catch {
      /* Private mode and full quotas are not worth an error. */
    }
  }, [layout])

  const toggleEditMode = useCallback(() => {
    setEditMode((v) => {
      const next = !v
      if (next) {
        setSelectedId(null)
        setView('room')
      } else {
        setEditing(null)
      }
      return next
    })
  }, [])

  /* Escape closes whatever is open, innermost first. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (resumeOpen) setResumeOpen(false)
      else if (selectedId) setSelectedId(null)
      else if (view === 'computer') setView('room')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, view, resumeOpen])

  const value = useMemo<RoomContextValue>(
    () => ({
      loading,
      progress,
      setProgress,
      finishLoading,
      hovered: hoveredId ? interactiveObjects[hoveredId] : null,
      hover,
      selected: selectedId ? interactiveObjects[selectedId] : null,
      select,
      view,
      enterComputer,
      exitComputer,
      resumeOpen,
      openResume,
      closeResume,
      discovered,
      audioOn,
      toggleAudio,
      ringLightBoost,
      toggleRingLight,
      isMobile,
      reducedMotion,
      editMode,
      toggleEditMode,
      editing,
      setEditing,
      dragging,
      setDragging,
      layout,
      setPlacement,
      nudge,
      rotate,
      resetPlacement,
      resetLayout,
    }),
    [
      loading,
      progress,
      finishLoading,
      hoveredId,
      hover,
      selectedId,
      select,
      view,
      enterComputer,
      exitComputer,
      resumeOpen,
      openResume,
      closeResume,
      discovered,
      audioOn,
      toggleAudio,
      ringLightBoost,
      toggleRingLight,
      isMobile,
      reducedMotion,
      editMode,
      toggleEditMode,
      editing,
      dragging,
      layout,
      setPlacement,
      nudge,
      rotate,
      resetPlacement,
      resetLayout,
    ],
  )

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>
}

export function useRoom() {
  const ctx = useContext(RoomContext)
  if (!ctx) throw new Error('useRoom must be used inside <RoomProvider>')
  return ctx
}
