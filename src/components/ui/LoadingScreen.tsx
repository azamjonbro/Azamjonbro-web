import { useEffect, useState } from 'react'
import { site } from '@/data/site'
import { useRoom } from '@/state/RoomContext'

/**
 * The entrance curtain.
 *
 * Nothing in the room is fetched — every texture is drawn at runtime — so
 * there is no download to narrate and a checklist of fake steps would be
 * theatre. This covers the first frame, reports the one thing that is real,
 * and gets out of the way.
 */
export function LoadingScreen() {
  const { loading, progress } = useRoom()
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (loading) return
    const timer = setTimeout(() => setGone(true), 900)
    return () => clearTimeout(timer)
  }, [loading])

  if (gone) return null

  const shown = loading ? progress : 100

  return (
    <div className={`loader${loading ? '' : ' is-done'}`} role="status" aria-live="polite">
      <div className="loader-inner">
        <p className="loader-brand">{site.fullName}</p>
        <p className="loader-status">{loading ? 'Preparing the room' : 'Ready'}</p>

        <div className="loader-bar" aria-hidden>
          <span className="loader-bar-fill" style={{ width: `${shown}%` }} />
        </div>

        <p className="loader-meta" aria-hidden>
          {site.domain}
        </p>
      </div>
    </div>
  )
}
