import { useEffect, useState } from 'react'
import { useRoom } from '@/state/RoomContext'

const STEPS = [
  'Loading 3D environment',
  'Loading assets',
  'Loading workstation',
  'Loading projects',
  'Loading interaction system',
]

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
  const filled = Math.round((shown / 100) * 20)

  return (
    <div className={`loader${loading ? '' : ' is-done'}`} role="status" aria-live="polite">
      <div className="loader-inner">
        <p className="loader-brand">AZAMJONBRO</p>
        <p className="loader-status">
          {loading ? 'INITIALIZING WORKSPACE…' : 'WORKSPACE READY'}
        </p>

        <div className="loader-bar" aria-hidden>
          <span className="loader-bar-fill" style={{ width: `${shown}%` }} />
        </div>

        <p className="loader-ascii" aria-hidden>
          {'█'.repeat(filled)}
          {'░'.repeat(20 - filled)} {Math.round(shown)}%
        </p>

        <ul className="loader-steps">
          {STEPS.map((step, i) => {
            const threshold = ((i + 1) / STEPS.length) * 100
            const done = shown >= threshold
            return (
              <li key={step} className={done ? 'is-done' : ''}>
                <span className="loader-step-mark">{done ? '✓' : '·'}</span>
                {step}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
