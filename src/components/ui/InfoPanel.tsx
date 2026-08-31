import { useEffect, useState } from 'react'
import { getProject } from '@/data/projects'
import { useRoom } from '@/state/RoomContext'

/**
 * The single panel that renders every object in the room.
 * Content comes from the interactive-object config, never from
 * a component written per object.
 */
export function InfoPanel() {
  const { selected, select, showProject } = useRoom()
  const [mounted, setMounted] = useState(false)

  /* Keep the node around for one frame so the exit transition can run. */
  useEffect(() => {
    if (selected) setMounted(true)
    else {
      const timer = setTimeout(() => setMounted(false), 320)
      return () => clearTimeout(timer)
    }
  }, [selected])

  if (!mounted && !selected) return null

  const data = selected
  const project = data?.projectId ? getProject(data.projectId) : undefined
  const accent = data?.accent ?? '#8b5cf6'

  return (
    <aside
      className={`panel${selected ? ' is-open' : ''}`}
      style={{ ['--accent' as string]: accent }}
      role="dialog"
      aria-modal="false"
      aria-label={data?.title}
    >
      <button type="button" className="panel-close" onClick={() => select(null)} aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" fill="none" />
        </svg>
      </button>

      <p className="panel-category">
        <span className="panel-category-dot" />
        {data?.category}
      </p>

      <h2 className="panel-title">{data?.title}</h2>

      {project && <p className="panel-subtitle">{project.subtitle}</p>}

      <p className="panel-description">{project?.longDescription ?? data?.description}</p>

      {project && <ProjectVisual id={project.id} accent={accent} />}

      {data?.bullets?.length ? (
        <div className="panel-block">
          <p className="panel-label">{project ? 'Key features' : 'Details'}</p>
          <ul className="panel-list">
            {data.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {data?.technologies?.length ? (
        <div className="panel-block">
          <p className="panel-label">{project ? 'Stack' : 'Tech'}</p>
          <ul className="panel-chips">
            {data.technologies.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {project && (
        <div className="panel-actions">
          {project.url && (
            <a
              className="panel-btn panel-btn-primary"
              href={project.url}
              target="_blank"
              rel="noreferrer noopener"
            >
              Live demo
            </a>
          )}
          <button
            type="button"
            className="panel-btn"
            onClick={() => {
              select(null)
              showProject(project.id)
            }}
          >
            Case study
          </button>
          {project.domain && <span className="panel-year">{project.domain}</span>}
        </div>
      )}
    </aside>
  )
}

/* ─── PROJECT PREVIEW ─────────────────────────────────────────── */
function ProjectVisual({ id, accent }: { id: string; accent: string }) {
  const project = getProject(id)
  if (!project) return null

  return (
    <div className="panel-visual" style={{ ['--accent' as string]: accent }}>
      <img
        src={project.image}
        alt={`${project.title} — ${project.subtitle}`}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}
