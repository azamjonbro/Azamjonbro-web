import { projects } from './projects'

export type Language = 'tsx' | 'ts' | 'css' | 'json' | 'md'

export interface VFile {
  type: 'file'
  name: string
  language: Language
  /** Optional interactive object / project this file reveals when opened. */
  reveals?: string
  content: string
}

export interface VFolder {
  type: 'folder'
  name: string
  children: VNode[]
}

export type VNode = VFile | VFolder

const file = (
  name: string,
  language: Language,
  content: string,
  reveals?: string,
): VFile => ({ type: 'file', name, language, content: content.replace(/^\n/, ''), reveals })

const folder = (name: string, children: VNode[]): VFolder => ({ type: 'folder', name, children })

export const fileSystem: VNode[] = [
  folder('src', [
    folder('components', [
      file(
        'InfoPanel.tsx',
        'tsx',
        `
import { interactiveObjects } from '@/data/interactiveObjects'
import { useRoom } from '@/state/RoomContext'

/**
 * One panel renders every object in the room.
 * Content comes from a central config - never from
 * a component written per object.
 */
export function InfoPanel() {
  const { selected, select } = useRoom()
  if (!selected) return null

  const data = interactiveObjects[selected]

  return (
    <aside className="panel" data-open>
      <header>
        <p className="category">{data.category}</p>
        <h2>{data.title}</h2>
      </header>

      <p>{data.description}</p>

      <ul>
        {data.bullets?.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>

      <footer>
        {data.technologies?.map((t) => (
          <span key={t} className="chip">{t}</span>
        ))}
      </footer>

      <button onClick={() => select(null)}>Close</button>
    </aside>
  )
}
`,
      ),
      file(
        'Tooltip.tsx',
        'tsx',
        `
import { useRoom } from '@/state/RoomContext'

/** Follows the cursor, names whatever is under it. */
export function Tooltip() {
  const { hovered, pointer } = useRoom()
  if (!hovered) return null

  return (
    <div
      className="tooltip"
      style={{ transform: \`translate3d(\${pointer.x}px, \${pointer.y}px, 0)\` }}
    >
      <span className="dot" />
      {hovered.label}
    </div>
  )
}
`,
      ),
      file(
        'ProjectCard.tsx',
        'tsx',
        `
import type { Project } from '@/data/projects'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article style={{ '--accent': project.accent } as React.CSSProperties}>
      <h3>{project.title}</h3>
      <p>{project.subtitle}</p>

      <ul>
        {project.technologies.map((tech) => (
          <li key={tech}>{tech}</li>
        ))}
      </ul>
    </article>
  )
}
`,
      ),
    ]),

    folder('room', [
      file(
        'Room.tsx',
        'tsx',
        `
import { Shell } from './Shell'
import { Desk } from './Desk'
import { Workstation } from './Workstation'
import { WallDisplays } from './WallDisplays'
import { Lighting } from './Lighting'

/**
 * The whole portfolio is this one function.
 * No routes, no sections, no scroll.
 */
export function Room() {
  return (
    <group>
      <Lighting />
      <Shell />

      <Desk />
      <Workstation />
      <WallDisplays />
    </group>
  )
}
`,
      ),
      file(
        'CameraRig.tsx',
        'tsx',
        `
import { useFrame, useThree } from '@react-three/fiber'
import { useRoom } from '@/state/RoomContext'

const YAW_LIMIT = 0.42
const PITCH_LIMIT = 0.2
const DAMPING = 3.5

/**
 * Mouse look with hard limits and critically damped
 * interpolation. Never a full 360, never nauseating.
 */
export function CameraRig() {
  const { camera } = useThree()
  const { focus, pointer } = useRoom()

  useFrame((_, delta) => {
    const t = 1 - Math.exp(-DAMPING * delta)

    const yaw = clamp(-pointer.nx * YAW_LIMIT, -YAW_LIMIT, YAW_LIMIT)
    const pitch = clamp(-pointer.ny * PITCH_LIMIT, -PITCH_LIMIT, PITCH_LIMIT)

    target.set(
      focus.position.x + yaw * 0.35,
      focus.position.y + pitch * 0.25,
      focus.position.z,
    )

    camera.position.lerp(target, t)
    camera.quaternion.slerp(orientation, t)
  })

  return null
}
`,
      ),
      file(
        'Lighting.tsx',
        'tsx',
        `
/**
 * Six lights carry the whole room:
 * key, monitor glow, ring light, LED strip,
 * window fill and a low ambient base.
 */
export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.16} color="#1b1d2c" />

      <directionalLight
        position={[2.4, 3.6, 1.8]}
        intensity={0.55}
        color="#ffe9d2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      />

      <pointLight position={[0, 1.3, -1.2]} intensity={4} color="#8b7cff" distance={3} />
      <pointLight position={[2, 1.7, -0.9]} intensity={3} color="#2f6bd8" distance={4} />
    </>
  )
}
`,
      ),
    ]),

    folder('hooks', [
      file(
        'useObjectInteraction.ts',
        'ts',
        `
import { useCallback } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useRoom } from '@/state/RoomContext'
import type { ObjectId } from '@/data/interactiveObjects'

/**
 * Every interactive mesh in the room shares this hook,
 * so hover, cursor, tooltip and selection stay consistent.
 */
export function useObjectInteraction(id: ObjectId) {
  const { hover, select } = useRoom()

  const onPointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      hover(id)
      document.body.style.cursor = 'pointer'
    },
    [id, hover],
  )

  const onPointerOut = useCallback(() => {
    hover(null)
    document.body.style.cursor = 'auto'
  }, [hover])

  const onClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      select(id)
    },
    [id, select],
  )

  return { onPointerOver, onPointerOut, onClick }
}
`,
      ),
      file(
        'useCameraInteraction.ts',
        'ts',
        `
import { useEffect } from 'react'

/**
 * Normalises pointer position to -1..1 once per move,
 * outside React state so it never triggers a re-render.
 */
export function useCameraInteraction() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.nx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.ny = (e.clientY / window.innerHeight) * 2 - 1
      pointer.x = e.clientX
      pointer.y = e.clientY
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
}
`,
      ),
    ]),

    folder('data', [
      file(
        'projects.ts',
        'ts',
        `export const projects = [\n${projects
          .map(
            (p) =>
              `  {\n    id: '${p.id}',\n    title: '${p.title}',\n` +
              `    category: '${p.category}',\n` +
              `    technologies: [${p.technologies.map((t) => `'${t}'`).join(', ')}],\n  },`,
          )
          .join('\n')}\n]\n`,
        'projects',
      ),
      ...projects.map((p) =>
        file(
          `${p.id}.ts`,
          'ts',
          `/**\n * ${p.title} — ${p.subtitle}.\n` +
            `${p.domain ? ` * Live at ${p.domain}.\n` : ''}` +
            ` * Open this file to read the case study.\n */\n` +
            `export const ${p.id.replace(/-/g, '_')} = {\n` +
            `  stack: [${p.technologies.map((t) => `'${t}'`).join(', ')}],\n\n` +
            `  features: [\n${p.features.map((f) => `    '${f.replace(/'/g, "\\'")}',`).join('\n')}\n  ],\n}\n`,
          p.id,
        ),
      ),
    ]),

    folder('styles', [
      file(
        'room.css',
        'css',
        `
:root {
  --bg: #07080d;
  --panel: rgba(16, 17, 26, 0.72);
  --border: rgba(255, 255, 255, 0.09);
  --accent: #8b5cf6;
  --text: #e8eaf2;
  --muted: #8b90a6;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 18px;
  backdrop-filter: blur(24px) saturate(140%);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.55);
}

.chip {
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--muted);
}
`,
      ),
    ]),

    file(
      'App.tsx',
      'tsx',
      `
import { RoomProvider } from '@/state/RoomContext'
import { RoomCanvas } from '@/components/RoomCanvas'
import { InfoPanel } from '@/components/InfoPanel'
import { Tooltip } from '@/components/Tooltip'
import { LoadingScreen } from '@/components/LoadingScreen'
import { Hint } from '@/components/Hint'

export default function App() {
  return (
    <RoomProvider>
      <RoomCanvas />

      <LoadingScreen />
      <Tooltip />
      <InfoPanel />
      <Hint />
    </RoomProvider>
  )
}
`,
    ),
    file(
      'main.tsx',
      'tsx',
      `
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/room.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`,
    ),
  ]),

  folder('public', [
    file('robots.txt', 'md', 'User-agent: *\nAllow: /\n'),
    file(
      'sitemap.xml',
      'md',
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset>\n  <url><loc>https://azamjonbro.uz</loc></url>\n</urlset>\n',
    ),
  ]),

  file(
    'README.md',
    'md',
    `
# azamjonbro.uz

One room. No scrolling.

The entire portfolio is a single interactive 3D
workspace - every object in it is clickable, and
this editor is running inside the monitor you are
looking at right now.

## Stack

- React 19 + TypeScript
- React Three Fiber + drei
- Vite

## Run

    npm install
    npm run dev
`,
  ),
]

/** Files that should already be open when the machine boots. */
export const defaultOpenFiles = ['App.tsx', 'Room.tsx']

export function findFile(nodes: VNode[], name: string, path: string[] = []): { file: VFile; path: string[] } | null {
  for (const node of nodes) {
    if (node.type === 'file') {
      if (node.name === name) return { file: node, path }
    } else {
      const hit = findFile(node.children, name, [...path, node.name])
      if (hit) return hit
    }
  }
  return null
}
