import { capabilities, type Capability } from '@/data/site'
import { Reveal, Section, SectionHead } from './Primitives'

/**
 * What can be built, drawn rather than bulleted.
 *
 * Each card carries a small generated schematic of the thing it names —
 * enough to read the shape of the system at a glance, and cheap enough
 * that eleven of them cost nothing.
 */
export function Capabilities() {
  return (
    <Section id="build" label="What I build" className="build">
      <SectionHead
        eyebrow="What I build"
        index="06"
        lead="Different shapes of software, built on the same stack. If it runs on a server and someone depends on it, it is in scope."
      >
        Systems, not pages.
      </SectionHead>

      <div className="build-grid">
        {capabilities.map((cap, i) => (
          <Reveal
            as="article"
            key={cap.id}
            delay={i * 45}
            className={`build-card${cap.wide ? ' is-wide' : ''}`}
          >
            <Glyph kind={cap.glyph} />
            <h3 className="build-card__title">{cap.title}</h3>
            <p className="build-card__body">{cap.body}</p>
            <span className="build-card__edge" aria-hidden />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* ─── SCHEMATICS ──────────────────────────────────────────────── */

const S = {
  stroke: 'currentColor',
  fill: 'none',
  strokeWidth: 1.25,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function Glyph({ kind }: { kind: Capability['glyph'] }) {
  return (
    <svg className="build-glyph" viewBox="0 0 44 44" aria-hidden>
      <g {...S}>{shapes[kind]}</g>
    </svg>
  )
}

const shapes: Record<Capability['glyph'], React.ReactNode> = {
  /* Three layers stacked — interface, service, data. */
  stack: (
    <>
      <rect x="6" y="6" width="32" height="9" rx="2" />
      <rect x="6" y="18" width="32" height="9" rx="2" />
      <rect x="6" y="30" width="32" height="8" rx="2" />
      <path d="M22 15v3M22 27v3" opacity="0.5" />
    </>
  ),
  /* A dashboard: sidebar and content cells. */
  grid: (
    <>
      <rect x="6" y="7" width="32" height="30" rx="3" />
      <path d="M15 7v30" />
      <path d="M20 15h13M20 22h13M20 29h8" opacity="0.55" />
    </>
  ),
  /* A pipeline with a branch — automation. */
  flow: (
    <>
      <circle cx="9" cy="22" r="3.5" />
      <circle cx="35" cy="12" r="3.5" />
      <circle cx="35" cy="32" r="3.5" />
      <path d="M12.5 22h8M20.5 22c6 0 5-10 11-10M20.5 22c6 0 5 10 11 10" />
    </>
  ),
  /* Availability: a month with two held days. */
  calendar: (
    <>
      <rect x="6" y="9" width="32" height="28" rx="3" />
      <path d="M6 17h32M14 5v7M30 5v7" />
      <rect x="12" y="22" width="7" height="6" rx="1.5" fill="currentColor" opacity="0.35" stroke="none" />
      <rect x="25" y="22" width="7" height="6" rx="1.5" fill="currentColor" opacity="0.6" stroke="none" />
    </>
  ),
  /* A counter terminal with a receipt. */
  terminal: (
    <>
      <rect x="8" y="6" width="28" height="20" rx="2.5" />
      <path d="M13 12h8M13 17h14" opacity="0.55" />
      <path d="M12 26v10l4-2 3 2 3-2 3 2 3-2 4 2V26" />
    </>
  ),
  /* A message bubble with a machine mark. */
  bot: (
    <>
      <rect x="6" y="9" width="32" height="21" rx="4" />
      <path d="M14 30l-3 7 9-7" />
      <circle cx="17" cy="19" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="27" cy="19" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  /* Endpoints hanging off a spine. */
  api: (
    <>
      <path d="M22 6v32" />
      <path d="M22 13h11M22 22H11M22 31h11" />
      <circle cx="35" cy="13" r="2.6" />
      <circle cx="9" cy="22" r="2.6" />
      <circle cx="35" cy="31" r="2.6" />
      <circle cx="22" cy="6" r="2" fill="currentColor" stroke="none" opacity="0.7" />
    </>
  ),
  /* A model step inside a pipeline. */
  spark: (
    <>
      <path d="M22 7l3.4 8.6L34 19l-8.6 3.4L22 31l-3.4-8.6L10 19l8.6-3.4z" />
      <path d="M33 31l1.6 4L38 36.6l-3.4 1.4L33 42l-1.4-4L28 36.6l3.6-1.6z" opacity="0.55" />
    </>
  ),
  /* An installable app on a handset. */
  device: (
    <>
      <rect x="13" y="5" width="18" height="34" rx="4" />
      <path d="M19 9h6" opacity="0.6" />
      <path d="M18 22h8M22 18v8" />
    </>
  ),
}
