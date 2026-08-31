import type { VFile, VFolder, VNode } from '@/data/fileSystem'

interface Props {
  tree: VNode[]
  isExpanded: (key: string) => boolean
  toggleFolder: (key: string) => void
  openFile: (file: VFile, path: string[]) => void
  activeTab: string
}

export function FileExplorer({ tree, isExpanded, toggleFolder, openFile, activeTab }: Props) {
  return (
    <div className="vm-explorer">
      <p className="vm-explorer-title">Explorer</p>
      <ul className="vm-tree">
        {tree.map((node) => (
          <TreeNode
            key={node.name}
            node={node}
            depth={0}
            path={[]}
            isExpanded={isExpanded}
            toggleFolder={toggleFolder}
            openFile={openFile}
            activeTab={activeTab}
          />
        ))}
      </ul>
    </div>
  )
}

function TreeNode({
  node,
  depth,
  path,
  isExpanded,
  toggleFolder,
  openFile,
  activeTab,
}: {
  node: VNode
  depth: number
  path: string[]
} & Omit<Props, 'tree'>) {
  const key = [...path, node.name].join('/')

  if (node.type === 'folder') {
    const open = isExpanded(key)
    return (
      <li>
        <button
          type="button"
          className="vm-row vm-folder"
          style={{ paddingLeft: 8 + depth * 12 }}
          onClick={() => toggleFolder(key)}
        >
          <span className={`vm-caret${open ? ' is-open' : ''}`}>›</span>
          <span className="vm-folder-icon" aria-hidden />
          {node.name}
        </button>

        {open && (
          <ul>
            {(node as VFolder).children.map((child) => (
              <TreeNode
                key={child.name}
                node={child}
                depth={depth + 1}
                path={[...path, node.name]}
                isExpanded={isExpanded}
                toggleFolder={toggleFolder}
                openFile={openFile}
                activeTab={activeTab}
              />
            ))}
          </ul>
        )}
      </li>
    )
  }

  const file = node as VFile
  const ext = file.name.split('.').pop() ?? ''

  return (
    <li>
      <button
        type="button"
        className={`vm-row vm-file${activeTab === file.name ? ' is-active' : ''}`}
        style={{ paddingLeft: 8 + depth * 12 }}
        onClick={() => openFile(file, path)}
      >
        <span className={`vm-ext vm-ext-${ext}`}>{ext}</span>
        {file.name}
      </button>
    </li>
  )
}
