import { useEffect, useRef, useState } from 'react'
import { processSteps } from '@/data/site'
import { useRoom } from '@/state/RoomContext'
import { Reveal, Section, SectionHead } from './Primitives'

/**
 * How a project actually goes, as a sticky stepper.
 *
 * The step the visitor is reading is decided by scroll position rather than
 * by hover, so the section tells its own story while being scrolled past —
 * and clicking a step is still available for anyone who wants to jump.
 */
export function Process() {
  const [active, setActive] = useState(0)
  const track = useRef<HTMLOListElement>(null)
  const { reducedMotion } = useRoom()

  useEffect(() => {
    const node = track.current
    if (!node) return

    /* One observer over the step markers; the last one past the line wins. */
    const marks = Array.from(node.querySelectorAll<HTMLElement>('[data-step]'))
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const n = Number((entry.target as HTMLElement).dataset.step)
          setActive(n)
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    marks.forEach((m) => io.observe(m))
    return () => io.disconnect()
  }, [])

  const step = processSteps[active]

  return (
    <Section id="process" label="How I work" className="process">
      <SectionHead
        eyebrow="How I work"
        index="05"
        lead="Six stages, in this order, every time. The order is the point — most of what goes wrong in a project goes wrong because one of these was skipped."
      >
        I don’t just deliver code.
        <br />
        <span className="sec-title__accent">I build working products.</span>
      </SectionHead>

      <div className="proc-grid">
        <div className="proc-sticky">
          <Reveal>
            <p className="proc-active__n" aria-hidden>
              {step.n}
            </p>
            <h3 className="proc-active__title">{step.title}</h3>
            <p className="proc-active__body">{step.body}</p>

            <div className="proc-progress" aria-hidden>
              <span
                className="proc-progress__fill"
                style={{ height: `${((active + 1) / processSteps.length) * 100}%` }}
              />
            </div>
          </Reveal>
        </div>

        <ol className="proc-steps" ref={track}>
          {processSteps.map((s, i) => (
            <li
              key={s.n}
              data-step={i}
              className={`proc-step${i === active ? ' is-active' : ''}${
                i < active ? ' is-past' : ''
              }`}
            >
              <button
                type="button"
                className="proc-step__hit"
                onClick={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                <span className="proc-step__n">{s.n}</span>
                <span className="proc-step__title">{s.title}</span>
                <span className="proc-step__body">{s.body}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      {reducedMotion && <p className="sr-only">Six stages: {processSteps.map((s) => s.title).join(', ')}.</p>}
    </Section>
  )
}
