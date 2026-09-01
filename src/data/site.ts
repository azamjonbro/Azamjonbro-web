/** Identity and copy. No component hard-codes a word of this. */

export const site = {
  name: 'AZAMJONBRO',
  person: 'Azamjon',
  role: 'Full-Stack Developer',
  domain: 'azamjonbro.uz',
  origin: 'https://azamjonbro.uz',
  title: 'Azamjon — Full-Stack Developer',
  description:
    'Azamjon is a full-stack developer building digital products, web applications, systems, APIs, automation and interactive experiences. Explore the work as a 3D space station.',
} as const

export const about = {
  heading: 'AZAMJON',
  role: 'Full-Stack Developer',
  statement:
    'I build digital products, web applications, systems and interactive experiences.',
  body: 'I work across frontend, backend, databases, APIs, infrastructure, automation and AI integrations.',
  closing: ["I don't just write code.", 'I build complete products.'],
  disciplines: [
    'Frontend',
    'Backend',
    'Databases',
    'APIs',
    'Infrastructure',
    'Automation',
    'AI Integration',
  ],
} as const

export const contact = {
  heading: 'Have an idea?',
  sub: "Let's build it.",
  body: 'Open for product work, client projects and long-running collaborations.',
  /* Only links that already existed in this repository. Nothing invented. */
  links: [
    { id: 'telegram', label: 'TELEGRAM', value: '@azamjonbro', href: 'https://t.me/azamjonbro' },
    {
      id: 'github',
      label: 'GITHUB',
      value: 'github.com/azamjonbro',
      href: 'https://github.com/azamjonbro',
    },
    { id: 'web', label: 'WEB', value: 'azamjonbro.uz', href: 'https://azamjonbro.uz' },
  ],
} as const

export const lab = {
  title: 'LAB',
  /* Rendered on the module in the world. */
  caption: 'FIELD NOTES',
  /* Shown only when no articles are filed. */
  status: 'COMING SOON',
  body: 'Write-ups on the systems behind these projects — the decisions, the constraints, and the parts that only show up in production.',
} as const
