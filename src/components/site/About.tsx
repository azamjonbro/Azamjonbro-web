import { about } from '@/data/site'
import { Reveal, Section, SectionHead } from './Primitives'

export function About() {
  const [headA, headB] = about.heading.split('\n')

  return (
    <Section id="about" label="About" className="about">
      <SectionHead eyebrow={about.eyebrow} index="02">
        {headA}
        <br />
        <span className="sec-title__accent">{headB}</span>
      </SectionHead>

      <div className="about-grid">
        <div className="about-prose">
          {about.body.map((para, i) => (
            <Reveal as="p" key={para.slice(0, 24)} delay={i * 90}>
              {para}
            </Reveal>
          ))}
        </div>

        <aside className="about-side">
          <Reveal delay={120}>
            <p className="about-label">Across</p>
            <ul className="about-disciplines">
              {about.disciplines.map((d, i) => (
                <li key={d} style={{ ['--d' as string]: `${i * 55}ms` }}>
                  <span className="about-disc__dot" aria-hidden />
                  {d}
                </li>
              ))}
            </ul>
          </Reveal>
        </aside>
      </div>

      {/* The through-line: idea to running system, as one continuous rule. */}
      <Reveal className="about-arc" delay={200}>
        <ol>
          {about.arc.map((step, i) => (
            <li key={step}>
              <span className="about-arc__n">{String(i + 1).padStart(2, '0')}</span>
              <span className="about-arc__label">{step}</span>
            </li>
          ))}
        </ol>
        <span className="about-arc__rule" aria-hidden />
      </Reveal>
    </Section>
  )
}
