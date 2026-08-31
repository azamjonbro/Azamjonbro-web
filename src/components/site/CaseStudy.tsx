import { useEffect, useRef } from 'react'
import { getProject } from '@/data/projects'
import { useRoom } from '@/state/RoomContext'

/**
 * The full case study for one project.
 *
 * Rendered as a sheet over the page rather than a route: there is one page,
 * the room behind it should not be torn down and rebuilt to read a project,
 * and Escape is a better back button than history for a single overlay.
 */
export function CaseStudy() {
  const { openProject, closeProject } = useRoom()
  const project = openProject ? getProject(openProject) : undefined
  const sheet = useRef<HTMLDivElement>(null)
  const closer = useRef<HTMLButtonElement>(null)

  /* Move focus in on open and keep Tab inside the sheet while it is up. */
  useEffect(() => {
    if (!project) return
    const previous = document.activeElement as HTMLElement | null
    closer.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !sheet.current) return
      const focusable = sheet.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previous?.focus?.()
    }
  }, [project])

  if (!project) return null

  return (
    <div
      className="cs-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cs-title"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) closeProject()
      }}
    >
      <div
        className="cs-sheet"
        ref={sheet}
        style={{ ['--accent' as string]: project.accent }}
      >
        <button type="button" className="cs-close" onClick={closeProject} ref={closer}>
          <span className="sr-only">Close case study</span>
          <svg width="15" height="15" viewBox="0 0 14 14" aria-hidden>
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
          <kbd>Esc</kbd>
        </button>

        <div className="cs-scroll">
          <header className="cs-head">
            <p className="cs-eyebrow">
              <span className="cs-eyebrow__idx">{project.index}</span>
              {project.category}
            </p>
            <h2 className="cs-title" id="cs-title">
              {project.title}
            </h2>
            <p className="cs-sub">{project.subtitle}</p>
          </header>

          <figure className="cs-figure">
            <img
              src={project.image}
              alt={`${project.title} — ${project.subtitle}`}
              width={1760}
              height={1100}
            />
          </figure>

          <div className="cs-body">
            <div className="cs-prose">
              <p>{project.longDescription}</p>
            </div>

            <aside className="cs-side">
              <div className="cs-block">
                <p className="cs-label">Stack</p>
                <ul className="cs-chips">
                  {project.technologies.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>

              {project.domain && (
                <div className="cs-block">
                  <p className="cs-label">Live at</p>
                  <p className="cs-domain">{project.domain}</p>
                </div>
              )}
            </aside>
          </div>

          <div className="cs-block cs-block--wide">
            <p className="cs-label">What it does</p>
            <ul className="cs-features">
              {project.features.map((f, i) => (
                <li key={f}>
                  <span aria-hidden>{String(i + 1).padStart(2, '0')}</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <footer className="cs-foot">
            {project.url ? (
              <a
                className="btn btn--primary"
                href={project.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open {project.domain}
                <svg width="13" height="13" viewBox="0 0 12 12" aria-hidden>
                  <path d="M1 11L11 1M4 1h7v7" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </a>
            ) : (
              <p className="cs-private">
                Internal platform — not publicly accessible.
              </p>
            )}

            <button type="button" className="btn" onClick={closeProject}>
              Back to the work
            </button>
          </footer>
        </div>
      </div>
    </div>
  )
}
