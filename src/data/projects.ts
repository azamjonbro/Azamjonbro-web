export interface Project {
  id: string
  /** Two-digit index rendered as the case-study number. */
  index: string
  title: string
  subtitle: string
  category: string
  /** One line. Must make the project understandable without the image. */
  description: string
  /** The case study, read when a project is opened. */
  longDescription: string
  technologies: string[]
  features: string[]
  /** Drives the accent of the case study and the wall panel in the room. */
  accent: string
  /** Public URL. Present ⇒ the project renders a "Live demo" button. */
  url?: string
  /** Shown as the label on that button and under the title. */
  domain?: string
  /** Screenshot under /public/projects. Falls back to a generated plate. */
  image: string
}

/**
 * Seven case studies, in the order they are shown.
 *
 * Screenshots go in /public/projects using the `image` path below — drop the
 * file in and it replaces the generated fallback plate with no code change.
 */
export const projects: Project[] = [
  {
    id: 'dacha',
    index: '01',
    title: 'Dacha',
    subtitle: 'Cottage booking platform',
    category: 'Booking Platform',
    description:
      'A booking platform for dachas and cottages — guests browse available properties by location, dates and capacity, then reserve one end to end.',
    longDescription:
      'Dacha turns a rental process that normally happens over phone calls and messages into a real reservation system. Guests search cottages by district, date range and group size, open a property to see its gallery, amenities and pricing, and hold a date through a booking flow that checks availability before it confirms. Behind it, owners manage listings, photos, seasonal pricing and the reservation calendar from an admin panel, so double bookings are impossible by construction rather than by attention.',
    technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS'],
    features: [
      'Availability search across location, date range and capacity',
      'Property pages with gallery, amenities and seasonal pricing',
      'Reservation flow with server-side availability locking',
      'Owner dashboard for listings, calendar and booking status',
    ],
    accent: '#6ee7a8',
    image: '/projects/dacha.webp',
  },
  {
    id: 'oil',
    index: '02',
    title: 'Oil',
    subtitle: 'Management & notification system',
    category: 'Internal System',
    description:
      'An oil management system that tracks stock and movement, and pushes automated notifications the moment a level, delivery or threshold needs a human.',
    longDescription:
      'Oil replaces the spreadsheet that a distribution operation quietly runs on. It records volumes, deliveries and consumption per tank and per client, and continuously evaluates each against its configured thresholds. When something crosses a line — a level running low, a delivery overdue, a reading that has not been submitted — the system raises it immediately through automated notifications instead of waiting for someone to open a report. The result is a team that finds out about a problem while it is still small.',
    technologies: ['Node.js', 'Express', 'PostgreSQL', 'Telegram Bot API', 'Automation'],
    features: [
      'Stock and movement tracking per tank and per client',
      'Configurable thresholds evaluated on every reading',
      'Automated alerts delivered straight to the responsible person',
      'Operational history and reporting for reconciliation',
    ],
    accent: '#f0b429',
    image: '/projects/oil.webp',
  },
  {
    id: 'swisswatchpremium',
    index: '03',
    title: 'Swiss Watch Premium',
    subtitle: 'Luxury timepiece house',
    category: 'Commercial · E-Commerce',
    description:
      'A commercial storefront for a luxury watch house — an authenticated collection presented with the restraint and editorial pacing the category expects.',
    longDescription:
      'Swiss Watch Premium sells timepieces where the presentation is part of the product. The site is built as a slow, deliberate editorial experience: a cinematic opening, a narrative on how each piece is sourced and verified, and a craftsmanship section that walks through movement, case, dial, bracelet and finishing before the collection is ever shown. The catalogue, enquiry flow and content are all driven from a CMS layer so the house can publish new pieces without touching the build.',
    technologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Node.js', 'Nginx'],
    features: [
      'Cinematic scroll-paced editorial homepage',
      'Authenticated collection catalogue with detail pages',
      'Enquiry and information-request flow',
      'Deployed and served on a hardened VPS behind Nginx and SSL',
    ],
    accent: '#c8a86b',
    url: 'https://swisswatchpremium.uz',
    domain: 'swisswatchpremium.uz',
    image: '/projects/swisswatchpremium.webp',
  },
  {
    id: 'algoritmedu',
    index: '04',
    title: 'Algoritm Education',
    subtitle: 'IT education platform',
    category: 'Education Product',
    description:
      'The digital platform for an IT education centre — course catalogue, enrolment and consultation capture, news, certificates and student outcomes in one product.',
    longDescription:
      'Algoritm Education is where the centre converts interest into enrolled students. Prospective students browse programmes — Frontend, Backend, Graphic Design, SMM, Cybersecurity and IT Kids — each with its duration and structure, then either enrol directly or leave a number for a free consultation, which routes to the sales team as a qualified lead. Around that core sit the parts that build trust before anyone commits: graduate outcomes, certificates, student testimonials, hackathon announcements and a news feed the centre maintains itself.',
    technologies: ['Vue', 'JavaScript', 'Node.js', 'Express', 'MongoDB', 'Nginx', 'PM2'],
    features: [
      'Course catalogue with programme duration and enrolment',
      'Consultation lead capture routed to the sales team',
      'News, events and hackathon announcements',
      'Certificates, testimonials and graduate outcome sections',
    ],
    accent: '#4f9dff',
    url: 'https://algoritmedu.uz',
    domain: 'algoritmedu.uz',
    image: '/projects/algoritmedu.webp',
  },
  {
    id: 'oxfordedu',
    index: '05',
    title: 'Oxford Education',
    subtitle: 'Multi-branch learning centre',
    category: 'Education Product',
    description:
      'A multi-branch education centre platform covering language, IT and exam-preparation programmes, its branch network, teaching staff and student results.',
    longDescription:
      'Oxford Education runs across a network of branches with hundreds of staff, and the site has to carry that scale without feeling like a directory. It presents the programmes — English, Russian, IT and exam preparation — alongside the teaching team, published student results, upcoming master classes and events, and a structured FAQ. A branch layer ties locations and contact routes together, and the whole thing is built to be updated continuously by the centre rather than rebuilt each term.',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'REST API', 'Linux'],
    features: [
      'Programme catalogue across language, IT and exam preparation',
      'Branch network with locations and contact routing',
      'Teaching team, results and testimonial sections',
      'Events, master classes and structured FAQ',
    ],
    accent: '#a78bfa',
    url: 'https://oxfordedu.uz',
    domain: 'oxfordedu.uz',
    image: '/projects/oxfordedu.webp',
  },
  {
    id: 'alharameen',
    index: '06',
    title: 'Al-Harameen',
    subtitle: 'Commercial web platform',
    category: 'Commercial',
    description:
      'A commercial web platform built around a product catalogue, with an admin layer the business runs itself and a deployment tuned for a small operations team.',
    longDescription:
      'Al-Harameen is a business web presence built to be operated, not just launched. The public side presents the catalogue with category browsing, detail pages and enquiry routing; the private side gives the business direct control over what is listed, what is featured and how it is described, without a developer in the loop. It is deployed on a VPS with Nginx, PM2 and automatic SSL renewal so it keeps running unattended.',
    technologies: ['React', 'JavaScript', 'Node.js', 'Express', 'MongoDB', 'Nginx', 'PM2'],
    features: [
      'Catalogue with category browsing and detail pages',
      'Admin panel for content and catalogue management',
      'Enquiry routing to the business',
      'VPS deployment with Nginx, PM2 and automatic SSL',
    ],
    accent: '#34d3c0',
    url: 'https://alharameen.uz',
    domain: 'alharameen.uz',
    image: '/projects/alharameen.webp',
  },
  {
    id: 'spring',
    index: '07',
    title: 'Spring',
    subtitle: 'Corporate LMS · SDS Max',
    category: 'Enterprise Platform',
    description:
      'A corporate learning management system: companies enrol their staff into structured training programmes and track who has completed what.',
    longDescription:
      'Spring is the internal training platform for SDS Max. Rather than a public course marketplace, it is built for an organisation training its own people: administrators define programmes and modules, assign them to employees or whole departments, and follow completion through the platform instead of through a spreadsheet. Employees get a single place that shows what they have been assigned, where they left off and what is still outstanding. The system is designed around the parts of corporate training that actually break — assignment, progress visibility and completion evidence.',
    technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Docker'],
    features: [
      'Structured programmes broken into modules and lessons',
      'Assignment to individual employees or whole departments',
      'Per-employee progress and completion tracking',
      'Administrative reporting across the organisation',
    ],
    accent: '#ff7a59',
    image: '/projects/spring.webp',
  },
]

export function getProject(id: string) {
  return projects.find((p) => p.id === id)
}

/** The three the room's wall panels show. */
export const featuredProjectIds = ['swisswatchpremium', 'algoritmedu', 'spring'] as const
