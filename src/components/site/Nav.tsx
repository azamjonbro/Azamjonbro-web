import { useEffect, useState } from 'react'
import { navItems, primaryNavIds, site } from '@/data/site'
import { scroll, scrollToSection } from '@/lib/scroll'
import { useRoom } from '@/state/RoomContext'

const items = navItems.filter((n) => primaryNavIds.includes(n.id))

/**
 * Fixed navigation that condenses once the hero is behind it.
 *
 * The active item is driven by the same section registry the camera reads,
 * so the highlighted link and the room's framing can never disagree.
 */
export function Nav() {
  const { activeSection, openResume } = useRoom()
  const [condensed, setCondensed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  /* Reading `scroll.y` on a rAF rather than a scroll listener keeps this on
     the same clock as everything else, and the state only flips twice. */
  useEffect(() => {
    let raf = 0
    const tick = () => {
      setCondensed(scroll.y > window.innerHeight * 0.55)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  /* A menu left open behind a section change is a trap on a phone. */
  useEffect(() => {
    setMenuOpen(false)
  }, [activeSection])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const go = (id: string) => {
    setMenuOpen(false)
    scrollToSection(id)
  }

  const activeId = navItems[activeSection]?.id ?? 'home'

  return (
    <>
      <a className="skip-link" href="#projects">
        Skip to projects
      </a>

      <header className={`nav${condensed ? ' is-condensed' : ''}`}>
        <button type="button" className="nav-brand" onClick={() => go('home')}>
          <span className="nav-brand__mark" aria-hidden />
          <span className="nav-brand__name">{site.name}</span>
          <span className="nav-brand__role">{site.role}</span>
        </button>

        <nav className="nav-links" aria-label="Sections">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-link${activeId === item.id ? ' is-active' : ''}`}
              onClick={() => go(item.id)}
              aria-current={activeId === item.id ? 'true' : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="nav-end">
          <button type="button" className="nav-resume" onClick={openResume}>
            Résumé
          </button>

          <button
            type="button"
            className={`nav-burger${menuOpen ? ' is-open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="nav-sheet"
          >
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <span aria-hidden />
            <span aria-hidden />
          </button>
        </div>
      </header>

      {/* Phones get a full sheet rather than a shrunken desktop bar. */}
      <div id="nav-sheet" className={`nav-sheet${menuOpen ? ' is-open' : ''}`} hidden={!menuOpen}>
        <nav aria-label="Sections">
          {navItems.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={`nav-sheet__link${activeId === item.id ? ' is-active' : ''}`}
              style={{ ['--d' as string]: `${i * 45}ms` }}
              onClick={() => go(item.id)}
            >
              <span className="nav-sheet__idx">{String(i + 1).padStart(2, '0')}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="nav-sheet__resume"
          onClick={() => {
            setMenuOpen(false)
            openResume()
          }}
        >
          Open résumé
        </button>
      </div>

      {/* Section rail — the vertical progress marker on wide screens. */}
      <aside className="rail" aria-hidden>
        {navItems.map((item, i) => (
          <span key={item.id} className={`rail-dot${i === activeSection ? ' is-active' : ''}`} />
        ))}
      </aside>
    </>
  )
}
