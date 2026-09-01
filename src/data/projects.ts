export interface Project {
  id: string
  title: string
  subtitle: string
  category: string
  description: string
  longDescription: string
  technologies: string[]
  features: string[]
  accent: string
  year: string
  url?: string
  github?: string
}

export const projects: Project[] = [
  {
    id: 'swisswatch',
    title: 'SwissWatch',
    subtitle: 'Luxury Watch E-Commerce Platform',
    category: 'E-Commerce',
    description:
      'Luxury watch e-commerce platform with a 3D product configurator, catalog filtering and a premium checkout flow.',
    longDescription:
      'A full-stack storefront for high-end timepieces. Every watch is presented with a real-time 3D viewer, deep faceted filtering, and a checkout designed to feel like a boutique rather than a shopping cart.',
    technologies: ['React', 'Node.js', 'MongoDB', 'Three.js'],
    features: [
      '3D watch configurator with real-time materials',
      'Faceted catalog search across movement, case and strap',
      'Stripe checkout with order lifecycle emails',
      'Admin dashboard for inventory and pricing',
    ],
    accent: '#c8a86b',
    year: '2025',
  },
  {
    id: 'hadiya',
    title: 'Hadiya',
    subtitle: 'AI-Powered POS System',
    category: 'AI / Business',
    description:
      'AI-powered POS and business management platform for retail operations, sales analytics and automated workflows.',
    longDescription:
      'Hadiya replaces the spreadsheet layer of a small business. It runs the point of sale, tracks inventory in real time, and uses AI agents to forecast restocking, summarise the day, and draft supplier messages automatically.',
    technologies: ['Vue', 'Node.js', 'MongoDB', 'AI Automation'],
    features: [
      'Offline-first point of sale with receipt printing',
      'AI demand forecasting and restock suggestions',
      'Automated daily business summaries',
      'Multi-branch inventory synchronisation',
    ],
    accent: '#8b5cf6',
    year: '2025',
  },
  {
    id: 'ctf',
    title: 'CTF Platform',
    subtitle: 'Cybersecurity Challenge Platform',
    category: 'Cybersecurity',
    description:
      'Capture-the-flag platform with isolated challenge containers, live scoring and a competitive team leaderboard.',
    longDescription:
      'A self-hosted CTF engine used to run security competitions. Each challenge boots in an isolated container, flags are validated server-side, and the scoreboard updates live over websockets as teams solve.',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    features: [
      'Per-team isolated challenge containers',
      'Live websocket scoreboard with dynamic scoring',
      'Writeup submission and review workflow',
      'Anti-flag-sharing detection',
    ],
    accent: '#38bdf8',
    year: '2024',
  },
]

export function getProject(id: string) {
  return projects.find((p) => p.id === id)
}
