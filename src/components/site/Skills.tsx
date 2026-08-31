import { useEffect, useRef, useState } from 'react'
import { skillGroups } from '@/data/site'
import { useRoom } from '@/state/RoomContext'
import { Reveal, Section, SectionHead } from './Primitives'

/** Every technology, flattened, keeping the group it belongs to. */
const wall = skillGroups.flatMap((g) => g.items.map((item) => ({ item, group: g.id })))

/**
 * The stack as a single wall of technologies, lit by the cursor.
 *
 * Categories filter by dimming rather than by removing, so the shape of
 * the wall never changes and nothing reflows under the pointer.
 */
export function Skills() {
  const { isTouch, reducedMotion } = useRoom()
  const [focus, setFocus] = useState<string | null>(null)
  const grid = useRef<HTMLDivElement>(null)

  /* The spotlight is two custom properties on the container, so the whole
     effect is one style write per frame instead of one per cell. */
  useEffect(() => {
    const node = grid.current
    if (!node || isTouch || reducedMotion) return

    const onMove = (e: PointerEvent) => {
      const box = node.getBoundingClientRect()
      node.style.setProperty('--mx', `${e.clientX - box.left}px`)
      node.style.setProperty('--my', `${e.clientY - box.top}px`)
      node.style.setProperty('--lit', '1')
    }
    const onLeave = () => node.style.setProperty('--lit', '0')

    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerleave', onLeave)
    return () => {
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerleave', onLeave)
    }
  }, [isTouch, reducedMotion])

  const active = skillGroups.find((g) => g.id === focus)

  return (
    <Section id="skills" label="Skills" className="skills">
      <SectionHead
        eyebrow="Stack"
        index="03"
        lead="The tools I reach for. Hover a category to isolate it — everything here is something I have shipped with, not something I have read about."
      >
        What I build with.
      </SectionHead>

      <Reveal className="skills-filters">
        <button
          type="button"
          className={`skills-filter${focus === null ? ' is-active' : ''}`}
          onClick={() => setFocus(null)}
          onPointerEnter={() => setFocus(null)}
        >
          All
          <span className="skills-filter__n">{wall.length}</span>
        </button>

        {skillGroups.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`skills-filter${focus === g.id ? ' is-active' : ''}`}
            onClick={() => setFocus((v) => (v === g.id ? null : g.id))}
            onPointerEnter={() => setFocus(g.id)}
            onFocus={() => setFocus(g.id)}
          >
            {g.label}
            <span className="skills-filter__n">{g.items.length}</span>
          </button>
        ))}
      </Reveal>

      <p className="skills-note" aria-live="polite">
        {active ? active.note : 'Everything, in one wall.'}
      </p>

      <Reveal>
        <div className={`skills-wall${focus ? ' is-filtered' : ''}`} ref={grid}>
          <span className="skills-spot" aria-hidden />
          {wall.map(({ item, group }, i) => (
            <span
              key={item}
              className={`skills-cell${focus && focus !== group ? ' is-dim' : ''}`}
              style={{ ['--d' as string]: `${i * 14}ms` }}
            >
              {item}
            </span>
          ))}
        </div>
      </Reveal>
    </Section>
  )
}
