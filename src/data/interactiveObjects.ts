import { featuredProjectIds, projects } from './projects'

export type ObjectId =
  | 'monitor'
  | 'macbook'
  | 'keyboard'
  | 'mouse'
  | 'microphone'
  | 'headphones'
  | 'ringLight'
  | 'clock'
  | 'cactus'
  | 'plant'
  | 'books'
  | 'chair'
  | 'speaker'
  | 'window'
  | 'swisswatchpremium'
  | 'algoritmedu'
  | 'spring'

export interface InteractiveObject {
  id: ObjectId
  /** Short label shown in the hover tooltip. */
  label: string
  title: string
  category: string
  description: string
  bullets?: string[]
  technologies?: string[]
  /** Marks project displays so the panel renders the rich project layout. */
  projectId?: string
  accent?: string
}

const base: InteractiveObject[] = [
  {
    id: 'monitor',
    label: 'MAIN WORKSTATION',
    title: 'Main Workstation',
    category: 'Development',
    description:
      'Primary development environment. Click the screen itself to sit down and use the machine.',
    bullets: [
      'Editor, terminal and file explorer are live',
      'Runs the build for every project in this room',
      '34" ultrawide on a monitor arm',
    ],
    technologies: ['React', 'TypeScript', 'Three.js', 'Node.js', 'Docker', 'AI Automation'],
  },
  {
    id: 'macbook',
    label: 'RESUME — OPEN CV',
    title: 'MacBook Air M1',
    category: 'Development Machine',
    description: 'The portable half of the setup. Click it to read the resume.',
    bullets: ['Local dev servers', 'Design and prototyping', 'Deploys and SSH sessions'],
    technologies: ['React', 'TypeScript', 'Three.js', 'Node.js', 'AI tools'],
  },
  {
    id: 'keyboard',
    label: 'MECHANICAL KEYBOARD',
    title: 'RGB Mechanical Keyboard',
    category: 'Input',
    description:
      '65% hot-swappable board with linear switches. The per-key lighting is not decoration — layers are colour coded.',
    bullets: ['Linear switches, lubed stabilisers', 'Vim navigation layer', 'Custom macro row'],
    technologies: ['Hardware', 'Ergonomics'],
  },
  {
    id: 'mouse',
    label: 'MOUSE',
    title: 'Wireless Mouse',
    category: 'Input',
    description: 'Lightweight wireless mouse — used mostly for design work and 3D scene navigation.',
    bullets: ['Low-latency wireless', 'Side buttons mapped to browser navigation'],
    technologies: ['Hardware'],
  },
  {
    id: 'microphone',
    label: 'MICROPHONE',
    title: 'Microphone',
    category: 'Audio / Content Creation',
    description: 'Professional condenser microphone on a boom arm with a shock mount.',
    bullets: ['Voice recording', 'YouTube videos', 'Online meetings', 'Course narration'],
    technologies: ['Audio', 'Content Creation'],
  },
  {
    id: 'headphones',
    label: 'AUDIO SETUP',
    title: 'Studio Headphones',
    category: 'Audio',
    description:
      'Closed-back monitoring headphones. Focus mode for long sessions, reference mode for editing.',
    bullets: ['Deep-work focus sessions', 'Mixing recorded voice', 'Calls'],
    technologies: ['Audio'],
  },
  {
    id: 'ringLight',
    label: 'RING LIGHT',
    title: 'Ring Light',
    category: 'Content Creation',
    description:
      'Soft key light on a tripod. Click it again to change how hard it hits the desk.',
    bullets: ['Video recording', 'Streaming', 'Screen-share calls'],
    technologies: ['Lighting', 'Content Creation'],
  },
  {
    id: 'clock',
    label: 'DIGITAL CLOCK',
    title: 'Digital Clock',
    category: 'Ambience',
    description:
      'It is always late here. The room is lit for night work — that is when most of this gets built.',
    bullets: ['Scene time: 22:18', 'Night ambience', 'City lights outside the window'],
    technologies: ['Ambience'],
  },
  {
    id: 'cactus',
    label: 'DESK PLANT',
    title: 'Cactus',
    category: 'Decoration',
    description: 'Low maintenance, high tolerance for neglect. The ideal developer plant.',
    bullets: ['Survives deploy weekends'],
    technologies: ['Decoration'],
  },
  {
    id: 'plant',
    label: 'TERRARIUM',
    title: 'Glass Terrarium',
    category: 'Decoration',
    description: 'A small detail that makes the workspace feel alive rather than assembled.',
    bullets: ['Closed ecosystem', 'Lit from the LED strip behind the desk'],
    technologies: ['Decoration'],
  },
  {
    id: 'books',
    label: 'BOOKS',
    title: 'Reference Books',
    category: 'Learning',
    description:
      'The stack that keeps getting rotated — systems design, networking, and one on rendering.',
    bullets: [
      'Designing Data-Intensive Applications',
      'Real-Time Rendering',
      'The Pragmatic Programmer',
    ],
    technologies: ['Learning', 'Knowledge'],
  },
  {
    id: 'chair',
    label: 'ERGONOMIC CHAIR',
    title: 'Ergonomic Chair',
    category: 'Workspace',
    description: 'Designed for long development sessions. The most under-rated dev tool there is.',
    bullets: ['Lumbar support', 'Adjustable armrests', 'Long coding sessions'],
    technologies: ['Comfort', 'Ergonomics'],
  },
  {
    id: 'speaker',
    label: 'SMART SPEAKER',
    title: 'Desk Speaker',
    category: 'Audio',
    description: 'Ambient sound while working. The ring reacts when it is playing.',
    bullets: ['Ambient / lo-fi during deep work', 'Silence during debugging'],
    technologies: ['Audio'],
  },
  {
    id: 'window',
    label: 'CITY AT NIGHT',
    title: 'The Window',
    category: 'Environment',
    description:
      'Blue curtains, half-drawn blinds, and a city that keeps working as late as this desk does.',
    bullets: ['Night city skyline', 'Ambient blue fill light'],
    technologies: ['Environment'],
  },
]

/* Only the three on the wall become room objects; the other four live in
   the page's project index and would have nothing to be clicked on. */
const projectObjects: InteractiveObject[] = projects
  .filter((p) => (featuredProjectIds as readonly string[]).includes(p.id))
  .map((p) => ({
    id: p.id as ObjectId,
    label: `${p.title.toUpperCase()} PROJECT`,
    title: p.title,
    category: p.category,
    description: p.description,
    bullets: p.features,
    technologies: p.technologies,
    projectId: p.id,
    accent: p.accent,
  }))

export const interactiveObjects: Record<ObjectId, InteractiveObject> = Object.fromEntries(
  [...base, ...projectObjects].map((o) => [o.id, o]),
) as Record<ObjectId, InteractiveObject>
