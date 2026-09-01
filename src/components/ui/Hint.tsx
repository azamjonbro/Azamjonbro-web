import { useEffect, useState } from 'react'
import { useRoom } from '@/state/RoomContext'

/** Appears once the room is ready, then gets out of the way. */
export function Hint() {
  const { loading, view, discovered } = useRoom()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (loading) return
    const show = setTimeout(() => setVisible(true), 700)
    const hide = setTimeout(() => setVisible(false), 7500)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [loading])

  /* Never argue with someone who is already exploring. */
  useEffect(() => {
    if (discovered.length > 0) setVisible(false)
  }, [discovered.length])

  if (view === 'computer') return null

  return (
    <div className={`hint${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
      <p>
        <span className="hint-key">Move your mouse</span> to explore
      </p>
      <p>
        <span className="hint-key">Click objects</span> to inspect
      </p>
    </div>
  )
}
