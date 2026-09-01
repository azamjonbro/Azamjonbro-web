import { useEffect, useRef, useState } from 'react'
import { projects, type Project } from '@/data/projects'
import { pointer } from '@/lib/pointer'
import { useRoom } from '@/state/RoomContext'
import { Reveal, Section, SectionHead } from './Primitives'

/**
 * The work, as an index rather than a grid.
 *
 * Seven identical cards would flatten seven different projects into one
 * shape. A numbered index gives each one a line of its own, and the
 * screenshot arrives on the cursor instead of taking up permanent space.
 */
export function Projects() {
  const { showProject, isTouch, isMobile } = useRoom()
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <Section id="projects" label="Selected work" className="projects">
      <SectionHead
        eyebrow="Selected work"
        index="01"
        lead="Seven products in production — booking platforms, internal systems, commercial storefronts and education products. Open one to read how it is built."
      >
        Things I built,
        <br />
        and still maintain.
      </SectionHead>

      <ol
        className={`proj-list${hovered ? ' is-focusing' : ''}`}
        onPointerLeave={() => setHovered(null)}
      >
        {projects.map((project, i) => (
          <Reveal as="li" key={project.id} delay={i * 60}>
            <Row
              project={project}
              active={hovered === project.id}
              onHover={() => setHovered(project.id)}
              onOpen={() => showProject(project.id)}
              showInlineImage={isTouch || isMobile}
            />
          </Reveal>
        ))}
      </ol>

      {!isTouch && !isMobile && <CursorPreview activeId={hovered} />}
    </Section>
  )
}

function Row({
  project,
  active,
  onHover,
  onOpen,
  showInlineImage,
}: {
  project: Project
  active: boolean
  onHover: () => void
  onOpen: () => void
  showInlineImage: boolean
}) {
  return (
    <article
      className={`proj${active ? ' is-active' : ''}`}
      style={{ ['--accent' as string]: project.accent }}
      onPointerEnter={onHover}
      onFocus={onHover}
    >
      {/* The whole row opens the case study. The live-demo anchor sits above
          it, so the two targets never fight. */}
      <button type="button" className="proj-hit" onClick={onOpen}>
        <span className="sr-only">Open case study: {project.title}</span>
      </button>

      <span className="proj-index" aria-hidden>
        {project.index}
      </span>

      <div className="proj-main">
        <h3 className="proj-title">{project.title}</h3>
        <p className="proj-sub">{project.subtitle}</p>
        <p className="proj-desc">{project.description}</p>

        <ul className="proj-tech">
          {project.technologies.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <div className="proj-meta">
        <span className="proj-cat">{project.category}</span>
        {project.domain && <span className="proj-domain">{project.domain}</span>}
        <span className="proj-open-cue" aria-hidden>
          Case study
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M1 11L11 1M4 1h7v7" stroke="currentColor" strokeWidth="1.4" fill="none" />
          </svg>
        </span>
      </div>

      {project.url && (
        <a
          className="proj-live"
          href={project.url}
          target="_blank"
          rel="noreferrer noopener"
          onClick={(e) => e.stopPropagation()}
        >
          Live demo
          <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
            <path d="M1 11L11 1M4 1h7v7" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </a>
      )}

      {/* Touch has no hover, so the screenshot has to live in the row. */}
      {showInlineImage && (
        <div className="proj-inline">
          <img src={project.image} alt={`${project.title} — ${project.subtitle}`} loading="lazy" />
        </div>
      )}

      <span className="proj-rule" aria-hidden />
    </article>
  )
}

/**
 * One preview element for the whole list, moved to the cursor on a frame
 * loop. Mounting an image per row and animating each would cost seven
 * decodes and seven composited layers for something only ever seen once.
 */
function CursorPreview({ activeId }: { activeId: string | null }) {
  const el = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const node = el.current
      if (node) {
        /* Trails the cursor rather than tracking it exactly — the lag is
           what makes it read as a physical object. */
        pos.current.x += (pointer.x - pos.current.x) * 0.14
        pos.current.y += (pointer.y - pos.current.y) * 0.14
        node.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className={`proj-preview${activeId ? ' is-visible' : ''}`} ref={el} aria-hidden>
      {projects.map((p) => (
        <img
          key={p.id}
          src={p.image}
          alt=""
          /* Not lazy: these live in a fixed, transparent container that a
             lazy loader has no reason to consider visible, so the first
             hover would land on an image that had not started downloading.
             Low priority instead — they queue behind everything that is
             actually on screen. */
          fetchPriority="low"
          decoding="async"
          className={activeId === p.id ? 'is-shown' : ''}
          style={{ ['--accent' as string]: p.accent }}
        />
      ))}
    </div>
  )
}
