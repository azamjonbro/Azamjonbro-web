import { useEffect, useRef, useState } from 'react'
import { projects } from '@/data/projects'

interface Line {
  kind: 'cmd' | 'out' | 'ok' | 'accent' | 'dim'
  text: string
}

const BOOT: Line[] = [
  { kind: 'cmd', text: 'npm run dev' },
  { kind: 'dim', text: '' },
  { kind: 'accent', text: 'VITE v8.2.0  ready in 482 ms' },
  { kind: 'dim', text: '' },
  { kind: 'out', text: '  ➜  Local:   http://localhost:5173/' },
  { kind: 'out', text: '  ➜  Network: use --host to expose' },
  { kind: 'dim', text: '' },
  { kind: 'ok', text: '  ✓ 3D scene loaded' },
  { kind: 'ok', text: '  ✓ Assets loaded' },
  { kind: 'ok', text: '  ✓ Interaction system ready' },
  { kind: 'dim', text: '' },
  { kind: 'dim', text: "  type 'help' for commands" },
]

const HELP: Line[] = [
  { kind: 'accent', text: 'Available commands' },
  { kind: 'out', text: '  help        show this list' },
  { kind: 'out', text: '  whoami      who built this room' },
  { kind: 'out', text: '  projects    list the shipped work' },
  { kind: 'out', text: '  stack       tools used day to day' },
  { kind: 'out', text: '  open <id>   open a project panel' },
  { kind: 'out', text: '  contact     how to get in touch' },
  { kind: 'out', text: '  clear       wipe the terminal' },
]

interface Props {
  /** Lets the terminal open a project panel out in the room. */
  onOpenProject: (id: string) => void
}

export function Terminal({ onOpenProject }: Props) {
  const [lines, setLines] = useState<Line[]>([])
  const [booted, setBooted] = useState(false)
  const [input, setInput] = useState('')
  const scroller = useRef<HTMLDivElement>(null)

  /* Type the boot log out one line at a time. */
  useEffect(() => {
    setLines([])
    let i = 0
    const timer = setInterval(() => {
      const line = BOOT[i]
      i += 1
      if (line) setLines((prev) => [...prev, line])
      if (i >= BOOT.length) {
        clearInterval(timer)
        setBooted(true)
      }
    }, 130)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight })
  }, [lines])

  const run = (raw: string) => {
    const cmd = raw.trim()
    const next: Line[] = [{ kind: 'cmd', text: cmd }]

    const [head, ...args] = cmd.toLowerCase().split(/\s+/)

    if (!cmd) {
      setLines((prev) => [...prev, { kind: 'cmd', text: '' }])
      return
    }

    switch (head) {
      case 'clear':
        setLines([])
        return

      case 'help':
        next.push(...HELP)
        break

      case 'whoami':
        next.push(
          { kind: 'accent', text: 'azamjonbro' },
          { kind: 'out', text: 'Full-stack developer · AI automation · DevOps' },
          { kind: 'out', text: 'Builds products, ships them, and keeps them running.' },
        )
        break

      case 'projects':
        next.push({ kind: 'accent', text: 'Shipped work' })
        projects.forEach((p) =>
          next.push({ kind: 'out', text: `  ${p.id.padEnd(12)} ${p.title} — ${p.category}` }),
        )
        next.push({ kind: 'dim', text: "  run 'open <id>' to inspect one" })
        break

      case 'stack':
        next.push(
          { kind: 'accent', text: 'Daily drivers' },
          { kind: 'out', text: '  frontend   React · Vue · TypeScript · Three.js' },
          { kind: 'out', text: '  backend    Node.js · Express · PostgreSQL · MongoDB' },
          { kind: 'out', text: '  devops     Docker · Linux · Nginx · CI/CD' },
          { kind: 'out', text: '  ai         Claude · OpenAI · agent automation' },
        )
        break

      case 'contact':
        next.push(
          { kind: 'accent', text: 'Get in touch' },
          { kind: 'out', text: '  web       azamjonbro.uz' },
          { kind: 'out', text: '  telegram  @azamjonbro' },
          { kind: 'out', text: '  github    github.com/azamjonbro' },
        )
        break

      case 'open': {
        const id = args[0]
        const hit = projects.find((p) => p.id === id)
        if (hit) {
          next.push({ kind: 'ok', text: `opening ${hit.title}…` })
          onOpenProject(hit.id)
        } else {
          next.push({ kind: 'out', text: `open: unknown project '${args[0] ?? ''}'` })
          next.push({ kind: 'dim', text: `  try: ${projects.map((p) => p.id).join(', ')}` })
        }
        break
      }

      case 'ls':
        next.push({ kind: 'out', text: 'src  public  index.html  package.json  README.md' })
        break

      default:
        next.push({ kind: 'out', text: `command not found: ${head}` })
        next.push({ kind: 'dim', text: "  type 'help' to see what works" })
    }

    setLines((prev) => [...prev, ...next])
  }

  return (
    <div className="vm-terminal">
      <div className="vm-terminal-bar">
        <span className="vm-terminal-tab is-active">TERMINAL</span>
        <span className="vm-terminal-tab">PROBLEMS</span>
        <span className="vm-terminal-tab">OUTPUT</span>
        <span className="vm-terminal-shell">zsh — azamjonbro</span>
      </div>

      <div className="vm-terminal-body" ref={scroller}>
        {lines.map((line, i) => (
          <p key={i} className={`vm-t-${line.kind}`}>
            {line.kind === 'cmd' ? <span className="vm-prompt">❯</span> : null}
            {line.text}
          </p>
        ))}

        {booted && (
          <form
            className="vm-terminal-input"
            onSubmit={(e) => {
              e.preventDefault()
              run(input)
              setInput('')
            }}
          >
            <span className="vm-prompt">❯</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              aria-label="Terminal input"
              placeholder="help"
            />
          </form>
        )}
      </div>
    </div>
  )
}
