import { about, contact, lab, site } from '@/data/site'
import { projects } from '@/data/projects'
import { skillGroups } from '@/data/skills'
import { missions, statusLabel } from '@/data/experience'
import { processSteps } from '@/data/process'

/**
 * The whole portfolio as a document.
 *
 * Rendered when WebGL is unavailable, and always present in the markup for
 * anything that reads the page rather than looks at it. The 3D world is the
 * way the content is presented, not the only place it exists — a visitor
 * without a GPU, a search crawler and a screen reader all get everything.
 */
export function Fallback({ visible }: { visible: boolean }) {
  return (
    <div className={visible ? 'doc' : 'doc is-offscreen'} aria-hidden={!visible ? undefined : undefined}>
      <header className="doc-head">
        <p className="doc-mark">{site.name}</p>
        <h1>
          {about.heading} — {about.role}
        </h1>
        <p className="doc-lead">{about.statement}</p>
        {visible && (
          <p className="doc-notice">
            This browser could not start WebGL, so the interactive station is
            unavailable. Everything it contains is below.
          </p>
        )}
      </header>

      <section aria-labelledby="doc-about">
        <h2 id="doc-about">About</h2>
        <p>{about.body}</p>
        <ul className="doc-inline">
          {about.disciplines.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        {about.closing.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>

      <section aria-labelledby="doc-projects">
        <h2 id="doc-projects">Projects</h2>
        {projects.map((project) => (
          <article key={project.id} className="doc-project">
            <h3>
              {project.index} — {project.name}
            </h3>
            <p className="doc-meta">{project.category}</p>
            <img
              src={project.image}
              alt={`${project.name} — ${project.category}`}
              width={1760}
              height={1100}
              loading="lazy"
              decoding="async"
            />
            <p>{project.description}</p>
            <p className="doc-meta">{project.technologies.join(' · ')}</p>
            {project.url && (
              <p>
                <a href={project.url} target="_blank" rel="noreferrer noopener">
                  View live project — {project.domain}
                </a>
              </p>
            )}
          </article>
        ))}
      </section>

      <section aria-labelledby="doc-skills">
        <h2 id="doc-skills">Skills</h2>
        {skillGroups.map((group) => (
          <div key={group.id}>
            <h3>{group.label}</h3>
            <ul>
              {group.items.map((skill) => (
                <li key={skill.name}>
                  <strong>{skill.name}</strong> — {skill.context}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section aria-labelledby="doc-experience">
        <h2 id="doc-experience">Experience</h2>
        {missions.map((mission) => (
          <article key={mission.id}>
            <h3>
              {mission.title} — {statusLabel[mission.status]}
            </h3>
            {mission.org && <p className="doc-meta">{mission.org}</p>}
            <p>{mission.body}</p>
            <ul>
              {mission.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section aria-labelledby="doc-process">
        <h2 id="doc-process">How I work</h2>
        <ol>
          {processSteps.map((step) => (
            <li key={step.n}>
              <strong>{step.title}</strong> — {step.body}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="doc-lab">
        <h2 id="doc-lab">{lab.title}</h2>
        <p>
          {lab.status}. {lab.body}
        </p>
      </section>

      <section aria-labelledby="doc-contact">
        <h2 id="doc-contact">Contact</h2>
        <p>
          {contact.heading} {contact.sub}
        </p>
        <p>{contact.body}</p>
        <ul>
          {contact.links.map((link) => (
            <li key={link.id}>
              <a href={link.href} target="_blank" rel="noreferrer noopener">
                {link.label}: {link.value}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <footer className="doc-foot">
        © {new Date().getFullYear()} {site.domain}
      </footer>
    </div>
  )
}
