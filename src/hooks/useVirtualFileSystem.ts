import { useCallback, useMemo, useState } from 'react'
import { fileSystem, findFile, type VFile, type VNode } from '@/data/fileSystem'

export interface OpenTab {
  name: string
  path: string[]
  file: VFile
}

const INITIAL_OPEN = ['App.tsx', 'Room.tsx']

/**
 * Drives the file explorer and editor tabs inside the virtual machine.
 * Entirely simulated — nothing here touches a real filesystem.
 */
export function useVirtualFileSystem() {
  const [expanded, setExpanded] = useState<string[]>(['src', 'src/room'])
  const [tabs, setTabs] = useState<OpenTab[]>(() =>
    INITIAL_OPEN.flatMap((name) => {
      const hit = findFile(fileSystem, name)
      return hit ? [{ name, path: hit.path, file: hit.file }] : []
    }),
  )
  const [activeTab, setActiveTab] = useState(() => INITIAL_OPEN[0])

  const toggleFolder = useCallback((key: string) => {
    setExpanded((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }, [])

  const openFile = useCallback((file: VFile, path: string[]) => {
    setTabs((prev) =>
      prev.some((t) => t.name === file.name) ? prev : [...prev, { name: file.name, path, file }],
    )
    setActiveTab(file.name)
  }, [])

  const closeTab = useCallback(
    (name: string) => {
      setTabs((prev) => {
        const next = prev.filter((t) => t.name !== name)
        setActiveTab((current) => {
          if (current !== name) return current
          return next.length ? next[next.length - 1].name : ''
        })
        return next
      })
    },
    [],
  )

  const active = useMemo(() => tabs.find((t) => t.name === activeTab) ?? null, [tabs, activeTab])

  const isExpanded = useCallback((key: string) => expanded.includes(key), [expanded])

  return {
    tree: fileSystem as VNode[],
    expanded,
    isExpanded,
    toggleFolder,
    tabs,
    activeTab,
    setActiveTab,
    openFile,
    closeTab,
    active,
  }
}
