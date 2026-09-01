import { useEffect, useRef } from 'react'
import { site } from '@/data/site'
import { scroll, scrollToSection } from '@/lib/scroll'
import { useRoom } from '@/state/RoomContext'
import { Magnetic, RiseText, Section } from './Primitives'

/**
 * The hero does not draw a background — the room behind the page is the
 * background, and this is the type layer sitting in front of it.
 *
 * Everything here fades out as the visitor scrolls so the room is briefly
 * alone on screen before the first section arrives.
 */
export function Hero() {
  const { loading, isTouch } = useRoom()
  const type = useRef<HTMLDivElement>(null)
  const cue = useRef<HTMLDivElement>(null)

  /* Parallax and fade written straight to the node. This runs every frame
     and must never touch React state. */
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const vh = window.innerHeight
      const t = Math.min(1, scroll.y / (vh * 0.85))
      if (type.current) {
        type.current.style.opacity = String(Math.max(0, 1 - t * 1.35))
        type.current.style.transform = `translate3d(0, ${-scroll.y * 0.22}px, 0)`
      }
      if (cue.current) cue.current.style.opacity = String(Math.max(0, 1 - t * 3))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <Section id="home" label="Introduction" className="hero">
      <div className={`hero-type${loading ? '' : ' is-ready'}`} ref={type}>
        <p className="hero-kicker">
          <span className="hero-kicker__dot" aria-hidden />
          {site.fullName} — {site.domain}
        </p>

        <h1 className="hero-title">
          <RiseText text={site.hero.line1} delay={120} />{' '}
          <RiseText text={site.hero.line2} className="hero-title__accent" delay={260} />
        </h1>

        <p className="hero-statement">{site.hero.statement}</p>

        <div className="hero-roles" aria-label="Focus areas">
          {site.roles.map((role, i) => (
            <span key={role} className="hero-role" style={{ ['--d' as string]: `${700 + i * 90}ms` }}>
              {role}
            </span>
          ))}
        </div>

        <div className="hero-cta">
          <Magnetic>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => scrollToSection('projects')}
            >
              <span>View the work</span>
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <path d="M7 1v12M1 7l6 6 6-6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </button>
          </Magnetic>

          <Magnetic strength={0.24}>
            <button type="button" className="btn" onClick={() => scrollToSection('contact')}>
              Start a project
            </button>
          </Magnetic>
        </div>
      </div>

      <div className={`hero-cue${loading ? '' : ' is-ready'}`} ref={cue}>
        <span className="hero-cue__line" aria-hidden />
        <p>
          {isTouch ? 'Scroll to explore' : 'Move to look around · click anything on the desk'}
        </p>
      </div>
    </Section>
  )
}
