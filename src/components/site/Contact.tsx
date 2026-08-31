import { contact, navItems, site } from '@/data/site'
import { scrollToSection } from '@/lib/scroll'
import { useRoom } from '@/state/RoomContext'
import { Magnetic, Reveal, Section } from './Primitives'

export function Contact() {
  const { openResume } = useRoom()
  const year = new Date().getFullYear()

  return (
    <Section id="contact" label="Contact" className="contact">
      <div className="contact-main">
        <Reveal className="sec-eyebrow">
          <span className="sec-eyebrow__idx">07</span>
          <span className="sec-eyebrow__rule" aria-hidden />
          <span className="sec-eyebrow__label">{contact.eyebrow}</span>
        </Reveal>

        <Reveal as="h2" delay={70} className="contact-heading">
          {contact.heading}
          <br />
          <span className="sec-title__accent">{contact.headingAccent}</span>
        </Reveal>

        <Reveal as="p" delay={150} className="contact-body">
          {contact.body}
        </Reveal>

        <Reveal delay={220} className="contact-cta">
          <Magnetic strength={0.28}>
            <a
              className="btn btn--primary btn--lg"
              href={contact.primary.href}
              target="_blank"
              rel="noreferrer noopener"
            >
              {contact.primary.label}
              <svg width="14" height="14" viewBox="0 0 12 12" aria-hidden>
                <path d="M1 11L11 1M4 1h7v7" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </a>
          </Magnetic>

          <Magnetic strength={0.2}>
            <button type="button" className="btn btn--lg" onClick={openResume}>
              Read the résumé
            </button>
          </Magnetic>
        </Reveal>

        <Reveal delay={300}>
          <ul className="contact-links">
            {contact.links.map((l) => (
              <li key={l.id}>
                <a href={l.href} target="_blank" rel="noreferrer noopener">
                  <span className="contact-links__k">{l.label}</span>
                  <span className="contact-links__v">{l.value}</span>
                  <span className="contact-links__go" aria-hidden>
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <footer className="foot">
        <div className="foot-brand">
          <span className="foot-mark" aria-hidden />
          <span className="foot-name">{site.fullName}</span>
          <span className="foot-role">{site.role}</span>
        </div>

        <nav className="foot-nav" aria-label="Footer">
          {navItems.map((n) => (
            <button key={n.id} type="button" onClick={() => scrollToSection(n.id)}>
              {n.label}
            </button>
          ))}
        </nav>

        <p className="foot-meta">
          © {year} {site.domain}
          <span aria-hidden> · </span>
          <span className="foot-colophon">Built with React, Three.js and no template.</span>
        </p>
      </footer>
    </Section>
  )
}
