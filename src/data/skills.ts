/**
 * The SKILLS array, as a constellation.
 *
 * `context` is what the technology is actually used for — never a duration,
 * a rating or a percentage, none of which would be true.
 */
export interface Skill {
  name: string
  context: string
}

export interface SkillGroup {
  id: string
  label: string
  /** Shown while the group is selected. */
  note: string
  accent: string
  items: Skill[]
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'frontend',
    label: 'Frontend',
    note: 'Interfaces that stay fast once they hold real content.',
    accent: '#5ad1ff',
    items: [
      { name: 'JavaScript', context: 'The base everything else on this list is built on.' },
      { name: 'TypeScript', context: 'Default for anything that has to survive a second developer.' },
      { name: 'React', context: 'Application UIs, dashboards, and this world you are standing in.' },
      { name: 'Vue', context: 'The stack behind most of the client platforms in the projects bay.' },
      { name: 'HTML', context: 'Semantic structure first — it is what accessibility is built on.' },
      { name: 'CSS', context: 'Layout, motion and design systems without a framework in the way.' },
      { name: 'Tailwind CSS', context: 'Fast, consistent styling on product work.' },
      { name: 'Vite', context: 'Build tooling for every frontend I start today.' },
      { name: 'Three.js', context: 'Real-time 3D on the web. This station is a Three.js scene.' },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    note: 'The layer every interface quietly depends on.',
    accent: '#7dffb0',
    items: [
      { name: 'Node.js', context: 'The runtime behind every server I ship.' },
      { name: 'Express.js', context: 'Routing, middleware and auth on production APIs.' },
      { name: 'REST API', context: 'Designed around the data model, documented before the endpoints.' },
    ],
  },
  {
    id: 'database',
    label: 'Database',
    note: 'The schema is the part that is expensive to change later.',
    accent: '#ffd36e',
    items: [
      { name: 'MongoDB', context: 'Document storage for content-heavy platforms.' },
      { name: 'PostgreSQL', context: 'Relational data where correctness matters more than flexibility.' },
      { name: 'SQLite', context: 'Embedded storage for tools and small services.' },
    ],
  },
  {
    id: 'devops',
    label: 'DevOps',
    note: 'Shipping is part of building, not a step after it.',
    accent: '#ff9bd2',
    items: [
      { name: 'Linux', context: 'Where the servers actually live.' },
      { name: 'Nginx', context: 'Reverse proxy, static serving and TLS termination.' },
      { name: 'PM2', context: 'Keeping Node processes alive and restarting them cleanly.' },
      { name: 'Docker', context: 'Reproducible environments across machines.' },
      { name: 'Git', context: 'Version control on everything, without exception.' },
      { name: 'GitHub', context: 'Code hosting, reviews and automation.' },
      { name: 'Vercel', context: 'Frontend deployment with preview builds.' },
      { name: 'SSL / HTTPS', context: 'Certificates and automatic renewal on every live domain.' },
    ],
  },
  {
    id: 'other',
    label: 'Automation & AI',
    note: 'The work that should not need a person.',
    accent: '#c4a4ff',
    items: [
      { name: 'Telegram Bots', context: 'Notifications and whole internal tools that live inside a chat.' },
      { name: 'OpenAI API', context: 'Language models wired in as a working step, not a demo.' },
      { name: 'AI integrations', context: 'Model-backed features inside real product flows.' },
      { name: 'Automation', context: 'Scheduled jobs and pipelines that remove a recurring manual task.' },
      { name: 'PWA', context: 'Installable, offline-tolerant web apps.' },
    ],
  },
]

export const allSkills = skillGroups.flatMap((g) =>
  g.items.map((s) => ({ ...s, group: g.id, accent: g.accent })),
)
