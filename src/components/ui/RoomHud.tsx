import { interactiveObjects } from '@/data/interactiveObjects'
import { useRoom } from '@/state/RoomContext'

const TOTAL = Object.keys(interactiveObjects).length

/** The only chrome outside the 3D scene: identity, progress, and a way back. */
export function RoomHud() {
  const { discovered, view, exitComputer, loading } = useRoom()

  if (loading) return null

  return (
    <>
      <header className="hud hud-top">
        <div className="hud-brand">
          <span className="hud-brand-mark" />
          <span className="hud-brand-name">azamjonbro</span>
          <span className="hud-brand-role">full-stack · ai · devops</span>
        </div>

        <p className="hud-counter">
          <span className="hud-counter-value">
            {String(discovered.length).padStart(2, '0')}
          </span>
          <span className="hud-counter-total">/ {TOTAL} discovered</span>
        </p>
      </header>

      {view === 'computer' && (
        <button type="button" className="hud-exit" onClick={exitComputer}>
          ← Step back from the desk
          <kbd>ESC</kbd>
        </button>
      )}
    </>
  )
}
