/** The six stages, in order. The order is the message. */
export interface ProcessStep {
  n: string
  title: string
  body: string
}

export const processSteps: ProcessStep[] = [
  {
    n: '01',
    title: 'Idea',
    body: 'Work out what is actually being built and who it is for, before a line of it exists.',
  },
  {
    n: '02',
    title: 'Architecture',
    body: 'Decide the data model, the boundaries and the stack. This is the part that is expensive to change later.',
  },
  {
    n: '03',
    title: 'Development',
    body: 'Frontend and backend together, against real data, in increments that always run.',
  },
  {
    n: '04',
    title: 'Integration',
    body: 'Wire in the outside world — third-party APIs, messaging, AI services, and the automation that removes manual steps.',
  },
  {
    n: '05',
    title: 'Deployment',
    body: 'A real server on a real domain: Nginx, SSL, process management. Undeployed is unfinished.',
  },
  {
    n: '06',
    title: 'Improvement',
    body: 'Watch it under real usage and keep going — performance, edge cases, and what nobody could specify up front.',
  },
]
