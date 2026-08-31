import { experience } from '@/data/site'
import { Reveal, Section, SectionHead } from './Primitives'

export function Experience() {
  return (
    <Section id="experience" label="Experience" className="experience">
      <SectionHead
        eyebrow="Experience"
        index="04"
        lead="Work measured in shipped products rather than job titles."
      >
        Where the work
        <br />
        actually happened.
      </SectionHead>

      <ol className="exp-list">
        {experience.map((entry, i) => (
          <Reveal as="li" key={entry.id} delay={i * 110} className="exp-item">
            <div className="exp-marker" aria-hidden>
              <span className="exp-marker__dot" />
              <span className="exp-marker__line" />
            </div>

            <div className="exp-body">
              <header className="exp-head">
                <h3 className="exp-role">{entry.role}</h3>
                <p className="exp-org">{entry.org}</p>
                {entry.period && <p className="exp-period">{entry.period}</p>}
              </header>

              <p className="exp-summary">{entry.summary}</p>

              <ul className="exp-points">
                {entry.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>

              <ul className="exp-stack">
                {entry.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}
