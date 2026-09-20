import { useEffect, useState } from 'react'
import { getZone, zones } from '@/data/zones'
import { HOME, getPlanet } from '@/data/planets'
import { requestJump } from '@/lib/input'
import { getProject } from '@/data/projects'
import { site } from '@/data/site'
import { routes } from '@/lib/router'
import { Link } from '@/components/site/Link'
import { useWorld } from '@/state/WorldContext'

/**
 * The 2D layer over the world.
 *
 * Everything here is transient: it names what the player is standing next to
 * and then gets out of the way. Nothing occupies screen space permanently
 * except the wordmark and the two controls in the corner.
 */
export function Hud() {
  const {
    stage, nearZone, nearProject, openZone, openProject,
    openPanel, showProject, hintSeen, isTouch, audioOn, toggleAudio,
    planet, blocked,
  } = useWorld()

  if (stage !== 'entered') return null
  const overlayOpen = openZone !== null || openProject !== null
  const offWorld = planet !== HOME

  const project = nearProject ? getProject(nearProject) : undefined
  const zone = nearZone ? getZone(nearZone) : undefined

  /* Standing at an exhibit takes priority over standing in the bay. */
  const target = project
    ? { label: project.name, caption: `PROJECT ${project.index}`, accent: project.accent, act: () => showProject(project.id) }
    : zone
      ? { label: zone.label, caption: zone.caption, accent: zone.accent, act: () => openPanel(zone.id) }
      : null

  return (
    <>
      <header className={`hud-top${overlayOpen ? ' is-hidden' : ''}`}>
        <p className="hud-mark">
          <span className="hud-mark__dot" aria-hidden />
          {site.name}
        </p>
        <p className="hud-role">{site.role}</p>
      </header>

      <div className={`hud-tools${overlayOpen ? ' is-hidden' : ''}`}>
        <Link className="hud-btn" to={routes.home}>
          <span aria-hidden>←</span>
          <span className="hud-btn__label">PORTFOLIO</span>
        </Link>

        <button
          type="button"
          className={`hud-btn${audioOn ? ' is-on' : ''}`}
          onClick={toggleAudio}
          aria-pressed={audioOn}
        >
          <span className="sr-only">{audioOn ? 'Mute ambience' : 'Enable ambience'}</span>
          <span aria-hidden>{audioOn ? '◉' : '◎'}</span>
          <span className="hud-btn__label" aria-hidden>SOUND</span>
        </button>
      </div>

      {!hintSeen && <ControlsHint isTouch={isTouch} />}

      <Prompt target={target} isTouch={isTouch} hidden={overlayOpen} />

      {/* Off-world there is nothing to navigate to, so the destination list
          gives its space back to the one instruction that still applies. */}
      {offWorld ? <Beacon hidden={overlayOpen} /> : <Compass hidden={overlayOpen} />}

      <Arrival />

      {isTouch && <JumpButton hidden={overlayOpen || blocked} />}
    </>
  )
}

/* ─── JUMP ────────────────────────────────────────────────────── */

/**
 * The touch jump.
 *
 * Bottom right, opposite the thumb on the stick, and raised clear of the
 * compass rail — the two controls are used at the same time and must never
 * be reachable by the same thumb.
 */
function JumpButton({ hidden }: { hidden: boolean }) {
  return (
    <button
      type="button"
      className={`jump-btn${hidden ? ' is-hidden' : ''}`}
      /* Pointer down, not click: waiting for the tap to complete adds the
         browser's own delay to a control that has to feel immediate. */
      onPointerDown={(e) => {
        e.preventDefault()
        requestJump()
      }}
      aria-hidden={hidden}
      tabIndex={-1}
    >
      <span className="sr-only">Jump</span>
      <span aria-hidden>▲</span>
    </button>
  )
}

/* ─── ARRIVAL CARD ────────────────────────────────────────────── */

/** Names the world you are falling toward, then gets out of the way. */
function Arrival() {
  const { planet, travel } = useWorld()
  const world = getPlanet(planet)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (travel !== 'idle') {
      setShown(true)
      return
    }
    /* Held past touchdown, so the name is still readable once the dust has
       settled rather than vanishing on the frame the controls come back. */
    const timer = setTimeout(() => setShown(false), 2800)
    return () => clearTimeout(timer)
  }, [travel, planet])

  const leaving = travel === 'leaving'

  return (
    <div
      className={`arrival${shown ? ' is-visible' : ''}`}
      style={{ ['--accent' as string]: world.accent }}
      aria-live="polite"
    >
      <p className="arrival-caption">{leaving ? 'LEAVING ORBIT' : 'ARRIVING'}</p>
      <p className="arrival-name">{world.name}</p>
      <p className="arrival-sub">{leaving ? 'TRAJECTORY UNPLANNED' : world.caption}</p>
    </div>
  )
}

/* ─── OFF-WORLD ───────────────────────────────────────────────── */

/** Where you are, and the only way back. */
function Beacon({ hidden }: { hidden: boolean }) {
  const { planet } = useWorld()
  const world = getPlanet(planet)

  return (
    <div
      className={`beacon${hidden ? ' is-hidden' : ''}`}
      style={{ ['--accent' as string]: world.accent }}
    >
      <span className="beacon-dot" aria-hidden />
      <span className="beacon-name">{world.name}</span>
      <span className="beacon-hint">JUMP OFF THE EDGE TO RETURN</span>
    </div>
  )
}

/* ─── INTERACT PROMPT ─────────────────────────────────────────── */

function Prompt({
  target,
  isTouch,
  hidden,
}: {
  target: { label: string; caption: string; accent: string; act: () => void } | null
  isTouch: boolean
  hidden: boolean
}) {
  const visible = Boolean(target) && !hidden

  return (
    <div
      className={`prompt${visible ? ' is-visible' : ''}`}
      style={target ? ({ ['--accent' as string]: target.accent }) : undefined}
    >
      <p className="prompt-caption">{target?.caption ?? ''}</p>
      <p className="prompt-label">{target?.label ?? ''}</p>

      {/* A real button, so the prompt works with a click, a tap, Enter or E. */}
      <button
        type="button"
        className="prompt-key"
        onClick={() => target?.act()}
        tabIndex={visible ? 0 : -1}
        aria-hidden={!visible}
      >
        {isTouch ? (
          <span>TAP TO EXPLORE</span>
        ) : (
          <>
            <kbd>E</kbd>
            <span>INTERACT</span>
          </>
        )}
      </button>
    </div>
  )
}

/* ─── CONTROLS HINT ───────────────────────────────────────────── */

function ControlsHint({ isTouch }: { isTouch: boolean }) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShown(true), 900)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`hint${shown ? ' is-visible' : ''}`}>
      {isTouch ? (
        <>
          <span><b>DRAG</b> MOVE</span>
          <span><b>▲</b> JUMP</span>
          <span><b>TAP</b> INTERACT</span>
        </>
      ) : (
        <>
          <span><b>W A S D</b> MOVE</span>
          <span><b>SPACE</b> JUMP</span>
          <span><b>DRAG</b> LOOK</span>
          <span><b>E</b> INTERACT</span>
        </>
      )}
    </div>
  )
}

/* ─── DESTINATION COMPASS ─────────────────────────────────────── */

/** Which destinations exist, and which one you are standing in. */
function Compass({ hidden }: { hidden: boolean }) {
  const { nearZone, openPanel } = useWorld()

  return (
    <nav className={`compass${hidden ? ' is-hidden' : ''}`} aria-label="Destinations">
      {zones.map((zone) => (
        <button
          key={zone.id}
          type="button"
          className={`compass-item${nearZone === zone.id ? ' is-active' : ''}`}
          style={{ ['--accent' as string]: zone.accent }}
          onClick={() => openPanel(zone.id)}
        >
          <span className="compass-dot" aria-hidden />
          <span className="compass-label">{zone.label}</span>
        </button>
      ))}
    </nav>
  )
}
