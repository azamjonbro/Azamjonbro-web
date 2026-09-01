import { useEffect, useRef, useState, type ReactNode } from 'react'
import { site } from '@/data/site'
import { projects } from '@/data/projects'
import { useRoom } from '@/state/RoomContext'
import '@/styles/mobile.css'

/**
 * Daily drivers, grouped the same way the room's terminal reports them
 * under `stack`. Kept here rather than in /data because nothing else
 * renders it.
 */
const STACK = [
  { label: 'Frontend', items: ['React', 'Vue', 'TypeScript', 'Three.js', 'Tailwind'] },
  { label: 'Backend', items: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB'] },
  { label: 'DevOps', items: ['Docker', 'Linux', 'Nginx', 'CI/CD'] },
  { label: 'AI', items: ['Claude', 'OpenAI', 'Agent automation'] },
] as const

const LINKS = [
  { k: 'Telegram', v: '@azamjonbro', href: 'https://t.me/azamjonbro' },
  { k: 'GitHub', v: 'github.com/azamjonbro', href: 'https://github.com/azamjonbro' },
  { k: 'Web', v: site.domain, href: `https://${site.domain}` },
] as const

/** Fades a section in the first time it scrolls into view. */
function Reveal({ children, id }: { children: ReactNode; id?: string }) {
  const el = useRef<HTMLElement>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const node = el.current
    if (!node || seen) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setSeen(true)
        io.disconnect()
      },
      { rootMargin: '-12% 0px' },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [seen])

  return (
    <section id={id} ref={el} className={`ml-section ml-reveal${seen ? ' is-in' : ''}`}>
      {children}
    </section>
  )
}

function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  const [open, setOpen] = useState(false)

  return (
    <article className="ml-card" style={{ ['--accent-c' as string]: project.accent }}>
      <div className="ml-card__top">
        <span className="ml-card__cat">{project.category}</span>
        <span className="ml-card__year">{project.year}</span>
      </div>

      <h3 className="ml-card__title">{project.title}</h3>
      <p className="ml-card__sub">{project.subtitle}</p>
      <p className="ml-card__desc">{open ? project.longDescription : project.description}</p>

      {open && (
        <ul className="ml-card__features">
          {project.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}

      <button type="button" className="ml-more" onClick={() => setOpen((v) => !v)}>
        {open ? '— Less' : '+ Details'}
      </button>

      <div className="ml-chips">
        {project.technologies.map((t) => (
          <span key={t} className="ml-chip">
            {t}
          </span>
        ))}
      </div>
    </article>
  )
}

/**
 * The phone build. No canvas, no three.js — the room is desktop-only.
 * Everything here is the same palette the room is lit by, so the two
 * read as one site.
 */
export function MobileLanding() {
  const { openResume } = useRoom()

  /* global.css locks the document for the 3D room; the landing scrolls. */
  useEffect(() => {
    document.documentElement.classList.add('is-landing')
    return () => document.documentElement.classList.remove('is-landing')
  }, [])

  return (
    <div className="ml">
      <div className="ml-bg" aria-hidden />

      <header className="ml-head">
        <span className="ml-wordmark">
          Azamjon<span>bro</span>
        </span>
        <button type="button" className="ml-btn ml-btn--sm" onClick={openResume}>
          Resume
        </button>
      </header>

      {/* ─── HERO ─── */}
      <section className="ml-hero">
        <span className="ml-status">
          <i />
          Open to work
        </span>

        <h1 className="ml-name">
          Azamjon
          <br />
          Abdullayev
        </h1>

        <div className="ml-roles">
          {site.roles.map((r) => (
            <span key={r} className="ml-role">
              {r}
            </span>
          ))}
        </div>

        <p className="ml-tagline">{site.tagline}</p>

        <div className="ml-cta">
          <button type="button" className="ml-btn ml-btn--primary" onClick={openResume}>
            View resume
          </button>
          <a className="ml-btn" href="#work">
            See the work
          </a>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <Reveal>
        <p className="ml-eyebrow">About</p>
        <h2 className="ml-h2">I build systems, not just pages.</h2>
        <p className="ml-body">{site.about}</p>
        <ul className="ml-manifesto">
          {site.philosophy.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Reveal>

      {/* ─── STACK ─── */}
      <Reveal>
        <p className="ml-eyebrow">Stack</p>
        <h2 className="ml-h2">Daily drivers</h2>
        <div className="ml-stack">
          {STACK.map((group) => (
            <div key={group.label}>
              <p className="ml-stack__label">{group.label}</p>
              <div className="ml-chips">
                {group.items.map((item) => (
                  <span key={item} className="ml-chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ─── WORK ─── */}
      <Reveal id="work">
        <p className="ml-eyebrow">Selected work</p>
        <h2 className="ml-h2">Things I shipped.</h2>
        <div className="ml-projects">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </Reveal>

      {/* ─── CONTACT ─── */}
      <Reveal>
        <p className="ml-eyebrow">Contact</p>
        <h2 className="ml-h2">Let's build something.</h2>
        <p className="ml-body">
          Fastest reply is on Telegram. The full 3D workspace lives on desktop — open{' '}
          {site.domain} on a larger screen to walk through the room.
        </p>

        <div className="ml-links">
          {LINKS.map((l) => (
            <a key={l.k} className="ml-link" href={l.href} target="_blank" rel="noreferrer">
              <span className="ml-link__k">{l.k}</span>
              <span className="ml-link__v">{l.v}</span>
              <span className="ml-link__go" aria-hidden>
                ↗
              </span>
            </a>
          ))}
        </div>
      </Reveal>

      <footer className="ml-foot">
        © {new Date().getFullYear()} {site.name} · {site.domain}
      </footer>
    </div>
  )
}
