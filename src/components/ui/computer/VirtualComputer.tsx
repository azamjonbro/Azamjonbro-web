import { useState } from 'react'
import { useVirtualFileSystem } from '@/hooks/useVirtualFileSystem'
import { useRoom } from '@/state/RoomContext'
import type { ObjectId } from '@/data/interactiveObjects'
import { FileExplorer } from './FileExplorer'
import { CodeEditor } from './CodeEditor'
import { Terminal } from './Terminal'

/**
 * The developer desktop rendered onto the monitor.
 * A focused mini-IDE — explorer, tabs, editor, terminal — not an OS.
 */
export function VirtualComputer() {
  const vfs = useVirtualFileSystem()
  const { select, exitComputer } = useRoom()
  const [terminalOpen, setTerminalOpen] = useState(true)
  const [explorerOpen, setExplorerOpen] = useState(true)

  const openProject = (id: string) => select(id as ObjectId)

  return (
    <div className="vm">
      {/* Title bar */}
      <header className="vm-titlebar">
        <div className="vm-traffic">
          <button
            type="button"
            className="vm-dot vm-dot-red"
            title="Leave the machine"
            onClick={exitComputer}
          />
          <button
            type="button"
            className="vm-dot vm-dot-amber"
            title="Toggle terminal"
            onClick={() => setTerminalOpen((v) => !v)}
          />
          <button
            type="button"
            className="vm-dot vm-dot-green"
            title="Toggle explorer"
            onClick={() => setExplorerOpen((v) => !v)}
          />
        </div>
        <p className="vm-title">
          {vfs.active ? `${vfs.active.name} — ` : ''}azamjonbro.uz — Visual Studio Code
        </p>
        <button type="button" className="vm-leave" onClick={exitComputer}>
          ESC to step back
        </button>
      </header>

      <div className="vm-body">
        {/* Activity bar */}
        <nav className="vm-activity">
          <button
            type="button"
            className={`vm-activity-btn${explorerOpen ? ' is-active' : ''}`}
            title="Explorer"
            onClick={() => setExplorerOpen((v) => !v)}
          >
            <Icon name="files" />
          </button>
          <button type="button" className="vm-activity-btn" title="Search">
            <Icon name="search" />
          </button>
          <button type="button" className="vm-activity-btn" title="Source control">
            <Icon name="git" />
          </button>
          <button
            type="button"
            className={`vm-activity-btn${terminalOpen ? ' is-active' : ''}`}
            title="Terminal"
            onClick={() => setTerminalOpen((v) => !v)}
          >
            <Icon name="terminal" />
          </button>
        </nav>

        {explorerOpen && (
          <FileExplorer
            tree={vfs.tree}
            isExpanded={vfs.isExpanded}
            toggleFolder={vfs.toggleFolder}
            openFile={(file, path) => {
              vfs.openFile(file, path)
              if (file.reveals && file.reveals !== 'projects') openProject(file.reveals)
            }}
            activeTab={vfs.activeTab}
          />
        )}

        <section className="vm-main">
          {/* Editor tabs */}
          <div className="vm-tabs">
            {vfs.tabs.map((tab) => (
              <div
                key={tab.name}
                className={`vm-tab${vfs.activeTab === tab.name ? ' is-active' : ''}`}
              >
                <button type="button" className="vm-tab-label" onClick={() => vfs.setActiveTab(tab.name)}>
                  <span className={`vm-ext vm-ext-${tab.name.split('.').pop()}`}>
                    {tab.name.split('.').pop()}
                  </span>
                  {tab.name}
                </button>
                <button
                  type="button"
                  className="vm-tab-close"
                  aria-label={`Close ${tab.name}`}
                  onClick={() => vfs.closeTab(tab.name)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Breadcrumb */}
          {vfs.active && (
            <p className="vm-breadcrumb">
              {[...vfs.active.path, vfs.active.name].join('  ›  ')}
            </p>
          )}

          <CodeEditor file={vfs.active?.file ?? null} />

          {terminalOpen && <Terminal onOpenProject={openProject} />}
        </section>
      </div>

      {/* Status bar */}
      <footer className="vm-status">
        <span className="vm-status-branch">main*</span>
        <span>TypeScript React</span>
        <span>UTF-8</span>
        <span>LF</span>
        <span className="vm-status-right">Ln 1, Col 1 · Spaces: 2</span>
      </footer>
    </div>
  )
}

function Icon({ name }: { name: 'files' | 'search' | 'git' | 'terminal' }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  if (name === 'files')
    return (
      <svg {...common}>
        <path d="M4 4h6l2 2h8v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      </svg>
    )
  if (name === 'search')
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-4.5-4.5" />
      </svg>
    )
  if (name === 'git')
    return (
      <svg {...common}>
        <circle cx="7" cy="6" r="2.4" />
        <circle cx="7" cy="18" r="2.4" />
        <circle cx="17" cy="12" r="2.4" />
        <path d="M7 8.4v7.2M9.4 6h3a2 2 0 0 1 2 2v2" />
      </svg>
    )
  return (
    <svg {...common}>
      <rect x="2.5" y="4" width="19" height="16" rx="2" />
      <path d="m7 9 3 3-3 3M13 15h4" />
    </svg>
  )
}
