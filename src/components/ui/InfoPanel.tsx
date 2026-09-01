import { useEffect, useState } from 'react'
import { getProject } from '@/data/projects'
import { useRoom } from '@/state/RoomContext'

/**
 * The single panel that renders every object in the room.
 * Content comes from the interactive-object config, never from
 * a component written per object.
 */
export function InfoPanel() {
  const { selected, select } = useRoom()
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
          <ExternalLink className="panel-btn panel-btn-primary" href={project.url}>
            Live demo
          </ExternalLink>
          <ExternalLink className="panel-btn" href={project.github}>
            GitHub
          </ExternalLink>
          <span className="panel-year">{project.year}</span>
        </div>
      )}
    </aside>
  )
}

/**
 * Links stay in place but read as unavailable until a URL is filled in,
 * rather than silently going nowhere.
 */
function ExternalLink({
  href,
  className,
  children,
}: {
  href?: string
  className: string
  children: string
}) {
  if (!href) {
    return (
      <span className={className} aria-disabled="true" title="Not public yet">
        {children}
      </span>
    )
  }

  return (
    <a className={className} href={href} target="_blank" rel="noreferrer noopener">
      {children}
    </a>
  )
}

/* ─── ABSTRACT PROJECT PREVIEW ────────────────────────────────── */
function ProjectVisual({ id, accent }: { id: string; accent: string }) {
  return (
    <div className="panel-visual" style={{ ['--accent' as string]: accent }}>
      <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.42" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <rect width="320" height="120" fill={`url(#grad-${id})`} />

        {id === 'swisswatch' && (
          <g stroke={accent} fill="none" strokeWidth="1.4" opacity="0.85">
            <circle cx="235" cy="60" r="40" />
            <circle cx="235" cy="60" r="32" opacity="0.4" />
            <path d="M235 60V34M235 60l19 11" strokeWidth="2" />
          </g>
        )}

        {id === 'hadiya' && (
          <g stroke={accent} fill="none" strokeWidth="1.4" opacity="0.8">
            <circle cx="235" cy="60" r="20" />
            <circle cx="235" cy="60" r="34" opacity="0.5" />
            <circle cx="235" cy="60" r="48" opacity="0.25" />
          </g>
        )}

        {id === 'ctf' && (
          <g stroke={accent} strokeWidth="1.2" opacity="0.75">
            {Array.from({ length: 16 }).map((_, i) => {
              const a = (i / 16) * Math.PI * 2
              return (
                <line
                  key={i}
                  x1={235 + Math.cos(a) * 12}
                  y1={60 + Math.sin(a) * 12}
                  x2={235 + Math.cos(a) * (34 + (i % 3) * 12)}
                  y2={60 + Math.sin(a) * (34 + (i % 3) * 12)}
                />
              )
            })}
          </g>
        )}

        <g fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1">
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1={i * 40} y1="0" x2={i * 40} y2="120" />
          ))}
        </g>
      </svg>
    </div>
  )
}
