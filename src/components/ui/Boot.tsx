import { useEffect, useState } from 'react'
import { site } from '@/data/site'
import { routes } from '@/lib/router'
import { Link } from '@/components/site/Link'
import { useWorld } from '@/state/WorldContext'

const SEQUENCE = [
  'ESTABLISHING UPLINK',
  'BUILDING STATION GEOMETRY',
  'CALIBRATING OPTICS',
  'SYNCHRONISING EXHIBITS',
]

/**
 * The cinematic opening, and the gesture that starts the audio context.
 *
 * The visitor has to click to enter, which is not a stylistic choice: a
 * browser will not let a page play a sound until someone has interacted with
 * it, and the same click is the only honest moment to start ambience.
 */
export function Boot() {
  const { stage, progress, enter, isTouch } = useWorld()
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (stage !== 'entered') return
    const timer = setTimeout(() => setGone(true), 1400)
    return () => clearTimeout(timer)
  }, [stage])

  if (gone) return null

  const ready = stage !== 'booting'
  const shown = ready ? 100 : Math.round(progress)
  const filled = Math.round((shown / 100) * 28)

  return (
    <div
      className={`boot${stage === 'entered' ? ' is-leaving' : ''}`}
      role={ready ? undefined : 'status'}
      aria-live="polite"
    >
      <div className="boot-grid" aria-hidden />

      <div className="boot-inner">
        <p className="boot-mark">{site.name}</p>

        <p className="boot-status">
          {ready ? 'SYSTEM READY' : 'INITIALIZING DIGITAL SPACE…'}
        </p>

        <div className="boot-bar" aria-hidden>
          <span className="boot-bar__fill" style={{ width: `${shown}%` }} />
        </div>

        <p className="boot-meter" aria-hidden>
          <span>{'█'.repeat(filled)}{'░'.repeat(28 - filled)}</span>
          <span className="boot-meter__pct">{String(shown).padStart(3, ' ')}%</span>
        </p>

        <ul className="boot-steps" aria-hidden>
          {SEQUENCE.map((step, i) => {
            const done = shown >= ((i + 1) / SEQUENCE.length) * 100
            return (
              <li key={step} className={done ? 'is-done' : ''}>
                <span>{done ? '✓' : '·'}</span>
                {step}
              </li>
            )
          })}
        </ul>

        <div className="boot-actions">
          <button
            type="button"
            className={`boot-enter${ready ? ' is-ready' : ''}`}
            onClick={enter}
            disabled={!ready}
          >
            <span>{isTouch ? 'START THE DEMO' : 'ENTER THE WORLD'}</span>
            <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden>
              <path d="M1 6h13M9 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>

          <Link className="boot-read" to={routes.home}>
            ← PORTFOLIO
          </Link>
        </div>

        <p className="boot-foot">
          {site.role} · {site.domain}
        </p>
      </div>
    </div>
  )
}
