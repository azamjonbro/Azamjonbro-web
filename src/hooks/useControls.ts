import { useEffect } from 'react'
import { bindInput } from '@/lib/input'
import { useWorld } from '@/state/WorldContext'

/**
 * Binds keyboard, drag and interact once, and routes the interact key.
 *
 * The routing lives here rather than in the input module because what E does
 * depends entirely on where the player is standing, which is state — and the
 * input module deliberately knows nothing about the world.
 */
export function useControls() {
  const {
    stage, blocked, nearZone, nearProject, openPanel, showProject,
  } = useWorld()

  useEffect(() => {
    if (stage !== 'entered') return

    return bindInput({
      element: document.body,
      blocked: () => blocked,
      onInteract: () => {
        if (blocked) return
        /* An exhibit under the player wins over the bay it stands in. */
        if (nearProject) showProject(nearProject)
        else if (nearZone) openPanel(nearZone)
      },
    })
  }, [stage, blocked, nearZone, nearProject, openPanel, showProject])
}
