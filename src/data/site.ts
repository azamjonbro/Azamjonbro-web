/**
 * Every word the site says about its owner, in one place.
 * No component hard-codes copy.
 */

export const site = {
  name: 'Azamjon',
  fullName: 'Azamjon Abdullayev',
  domain: 'azamjonbro.uz',
  origin: 'https://azamjonbro.uz',
  title: 'Azamjon — Full-Stack Developer',
  role: 'Full-Stack Developer',
  description:
    'Full-stack developer building web applications, digital products, APIs, automation and interactive experiences — from architecture through to deployment.',

  /** The hero statement. Deliberately two lines, deliberately short. */
  hero: {
    line1: 'I build digital',
    line2: 'products that ship.',
    statement:
      'Full-stack developer working across interfaces, systems and infrastructure — taking an idea from architecture to a running product on a live domain.',
  },

  roles: ['Full-Stack', 'Systems', 'Automation', 'AI Integration'] as const,
} as const

/* ─── NAVIGATION ──────────────────────────────────────────────── */

export interface NavItem {
  id: string
  label: string
  /** Index of the camera shot this section parks the room camera at. */
  shot: number
}

/**
 * Order is the document order. `shot` indexes CAMERA.shots in lib/layout,
 * so the room and the page can never disagree about where the camera is.
 */
export const navItems: NavItem[] = [
  { id: 'home', label: 'Home', shot: 0 },
  { id: 'projects', label: 'Projects', shot: 1 },
  { id: 'about', label: 'About', shot: 2 },
  { id: 'skills', label: 'Skills', shot: 3 },
  { id: 'experience', label: 'Experience', shot: 4 },
  { id: 'process', label: 'Process', shot: 5 },
  { id: 'build', label: 'Build', shot: 6 },
  { id: 'contact', label: 'Contact', shot: 7 },
]

/** The subset shown in the navbar — Process and Build live inside the flow. */
export const primaryNavIds = ['home', 'projects', 'about', 'skills', 'experience', 'contact']

/* ─── ABOUT ───────────────────────────────────────────────────── */

export const about = {
  eyebrow: 'About',
  heading: 'I don’t hand over code.\nI hand over working products.',
  body: [
    'I work across the whole stack because that is where the interesting problems live. An interface is only as good as the API behind it, an API is only as good as the schema under it, and none of it matters until it is running on a real server, on a real domain, for real users.',
    'So I build the whole line. I design the architecture, write the frontend and the backend, model the database, wire the integrations, put it behind Nginx with SSL, and keep it alive after launch. When something needs to happen without a human, I automate it — a Telegram bot, a scheduled job, an AI-backed step in a pipeline.',
    'What I care about is the distance between an idea and a thing that works. I try to make that distance as short as possible, and then I stay responsible for what I shipped.',
  ],
  disciplines: [
    'Frontend',
    'Backend',
    'Databases',
    'APIs',
    'DevOps',
    'Automation',
    'AI Integration',
    'Product',
  ],
  /** The through-line, rendered as the arc from idea to running system. */
  arc: ['Concept', 'Architecture', 'Development', 'Deployment'],
}

/* ─── SKILLS ──────────────────────────────────────────────────── */

export interface SkillGroup {
  id: string
  label: string
  /** Rendered under the group name when the group is focused. */
  note: string
  items: string[]
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'frontend',
    label: 'Frontend',
    note: 'Interfaces that stay fast under real content.',
    items: ['JavaScript', 'TypeScript', 'React', 'Vue', 'HTML', 'CSS', 'Tailwind CSS', 'Vite', 'Three.js', 'PWA'],
  },
  {
    id: 'backend',
    label: 'Backend',
    note: 'The layer everything else depends on.',
    items: ['Node.js', 'Express.js', 'REST APIs'],
  },
  {
    id: 'data',
    label: 'Data',
    note: 'Schemas designed before the first query is written.',
    items: ['PostgreSQL', 'MongoDB', 'SQLite'],
  },
  {
    id: 'infra',
    label: 'Infrastructure',
    note: 'Shipping is part of building, not a step after it.',
    items: [
      'Linux',
      'Nginx',
      'PM2',
      'Docker',
      'Git',
      'GitHub',
      'Vercel',
      'Server deployment',
      'SSL / HTTPS',
    ],
  },
  {
    id: 'automation',
    label: 'Automation & AI',
    note: 'The work that should not need a person.',
    items: ['Telegram Bots', 'OpenAI API', 'AI API integrations', 'Automation'],
  },
]

/* ─── EXPERIENCE ──────────────────────────────────────────────── */

export interface ExperienceEntry {
  id: string
  role: string
  org: string
  /** Left blank rather than invented. */
  period?: string
  summary: string
  points: string[]
  stack: string[]
}

export const experience: ExperienceEntry[] = [
  {
    id: 'fullstack',
    role: 'Full-Stack Developer',
    org: 'Independent · Client & product work',
    summary:
      'Building production websites, web applications, dashboards, booking systems, APIs and automation — and running them after launch.',
    points: [
      'Shipped commercial platforms live on their own domains, including swisswatchpremium.uz, algoritmedu.uz and oxfordedu.uz.',
      'Designed and built REST APIs and the data models underneath them, across PostgreSQL, MongoDB and SQLite.',
      'Built booking and reservation systems where availability correctness is a hard requirement, not a nice-to-have.',
      'Deployed and maintained services on Linux VPS infrastructure with Nginx, PM2 and automatic SSL renewal.',
      'Automated recurring operational work through Telegram bots, scheduled jobs and AI-backed pipeline steps.',
    ],
    stack: ['React', 'Vue', 'TypeScript', 'Node.js', 'PostgreSQL', 'MongoDB', 'Docker', 'Nginx'],
  },
  {
    id: 'algoritm',
    role: 'Developer · Mentor',
    org: 'Algoritm Education',
    summary:
      'Technical project work on the education platform, plus mentoring the students building on top of it.',
    points: [
      'Developed and maintained the education platform — course catalogue, enrolment flow and lead capture.',
      'Shaped the technical architecture behind the product rather than only implementing against it.',
      'Mentored students through real project work: code review, debugging, and the parts of development that are not syntax.',
      'Guided student projects from an idea through to something deployed and demonstrable.',
    ],
    stack: ['Vue', 'JavaScript', 'Node.js', 'Express', 'MongoDB', 'Git'],
  },
]

/* ─── HOW I WORK ──────────────────────────────────────────────── */

export interface ProcessStep {
  n: string
  title: string
  body: string
}

export const processSteps: ProcessStep[] = [
  {
    n: '01',
    title: 'Idea',
    body: 'Work out what is actually being built and who it is for. Most failed projects were understood wrongly on day one, not built wrongly on day forty.',
  },
  {
    n: '02',
    title: 'Architecture',
    body: 'Decide the data model, the boundaries and the stack before writing feature code. The schema is the part that is expensive to change later.',
  },
  {
    n: '03',
    title: 'Development',
    body: 'Build the frontend and backend together, against real data, in small working increments — so there is always something that runs.',
  },
  {
    n: '04',
    title: 'Integration',
    body: 'Wire in the outside world: payments, messaging, third-party APIs, AI services, and the automation that removes manual steps.',
  },
  {
    n: '05',
    title: 'Deployment',
    body: 'Put it on a real server on a real domain — Nginx, SSL, process management, backups. A product that is not deployed is not finished.',
  },
  {
    n: '06',
    title: 'Improvement',
    body: 'Watch it under real usage and keep going. Performance, edge cases, and the features nobody could have specified before launch.',
  },
]

/* ─── WHAT I BUILD ────────────────────────────────────────────── */

export interface Capability {
  id: string
  title: string
  body: string
  /** Chooses the generated diagram drawn on the card. */
  glyph: 'stack' | 'grid' | 'flow' | 'calendar' | 'terminal' | 'bot' | 'api' | 'spark' | 'device'
  /** Cards marked wide take two columns on desktop. */
  wide?: boolean
}

export const capabilities: Capability[] = [
  {
    id: 'web-apps',
    title: 'Web applications',
    body: 'Full products with authentication, real data and an interface that holds up once it is actually populated.',
    glyph: 'stack',
    wide: true,
  },
  {
    id: 'saas',
    title: 'SaaS platforms',
    body: 'Multi-tenant products with accounts, roles, billing hooks and an admin surface.',
    glyph: 'grid',
  },
  {
    id: 'dashboards',
    title: 'Admin dashboards',
    body: 'The back office that decides whether a product is actually operable by the people who run it.',
    glyph: 'grid',
  },
  {
    id: 'booking',
    title: 'Booking systems',
    body: 'Availability, reservations and calendars, with correctness enforced on the server.',
    glyph: 'calendar',
  },
  {
    id: 'pos',
    title: 'POS systems',
    body: 'Point of sale built for a counter — fast input, resilient to a dropped connection.',
    glyph: 'terminal',
  },
  {
    id: 'bots',
    title: 'Telegram bots',
    body: 'Notifications, internal tools and whole interfaces that live inside a chat.',
    glyph: 'bot',
  },
  {
    id: 'apis',
    title: 'REST APIs',
    body: 'Documented, versioned interfaces with the schema designed before the endpoints.',
    glyph: 'api',
    wide: true,
  },
  {
    id: 'ai',
    title: 'AI-powered tools',
    body: 'Language models integrated as a working part of a pipeline, not as a demo.',
    glyph: 'spark',
  },
  {
    id: 'automation',
    title: 'Automation systems',
    body: 'Scheduled jobs, alerts and pipelines that remove a recurring manual task permanently.',
    glyph: 'flow',
  },
  {
    id: 'pwa',
    title: 'PWA applications',
    body: 'Installable, offline-tolerant web apps that behave like the native thing.',
    glyph: 'device',
  },
  {
    id: 'custom',
    title: 'Custom business software',
    body: 'The internal system a business has been running on a spreadsheet, built properly.',
    glyph: 'stack',
  },
]

/* ─── CONTACT ─────────────────────────────────────────────────── */

export const contact = {
  eyebrow: 'Contact',
  heading: 'Have an idea?',
  headingAccent: 'Let’s build it.',
  body: 'Available for product work, client projects and long-running collaborations. Telegram is the fastest way to reach me.',
  primary: {
    label: 'Message on Telegram',
    href: 'https://t.me/azamjonbro',
  },
  links: [
    { id: 'telegram', label: 'Telegram', value: '@azamjonbro', href: 'https://t.me/azamjonbro' },
    {
      id: 'github',
      label: 'GitHub',
      value: 'github.com/azamjonbro',
      href: 'https://github.com/azamjonbro',
    },
  ],
} as const
