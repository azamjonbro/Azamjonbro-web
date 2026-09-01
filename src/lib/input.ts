/**
 * Every control surface, collapsed into one struct read once per frame.
 *
 * Keyboard, virtual joystick and camera drag all write here rather than into
 * React state: movement changes every frame, and a re-render per frame would
 * cost more than the entire scene. Nothing in this module renders.
 */
export const input = {
  /** Desired movement on the station floor, -1 → 1, already clamped to a disc. */
  moveX: 0,
  moveZ: 0,
  /** Camera orbit, accumulated from drag and from pointer position. */
  yaw: 0,
  pitch: 0.28,
  /** Set for one frame when interact is pressed. Consumers clear it. */
  interact: false,
  /** True while any movement control is engaged — used to retire the hint. */
  moving: false,
  /** Pointer in normalised device coordinates, for the idle camera drift. */
  nx: 0,
  ny: 0,
  /** Raw client pixels, for the custom cursor. */
  px: 0,
  py: 0,
}

const PITCH_MIN = 0.02
const PITCH_MAX = 0.72

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

/** Frame-rate independent damping factor. */
export function damp(rate: number, delta: number) {
  return 1 - Math.exp(-rate * delta)
}

const held = new Set<string>()

/** Keys that must not also scroll or search the page while exploring. */
const CONSUMED = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Space',
])

function readKeyboard() {
  const x = (held.has('KeyD') || held.has('ArrowRight') ? 1 : 0) -
            (held.has('KeyA') || held.has('ArrowLeft') ? 1 : 0)
  const z = (held.has('KeyS') || held.has('ArrowDown') ? 1 : 0) -
            (held.has('KeyW') || held.has('ArrowUp') ? 1 : 0)
  return { x, z }
}

/* The joystick writes here directly; keyboard is merged on top each frame. */
let stick = { x: 0, z: 0 }

export function setStick(x: number, z: number) {
  stick = { x, z }
}

/** Recomputes `moveX/moveZ` from whichever control is active. */
function syncMove() {
  const key = readKeyboard()
  let x = key.x + stick.x
  let z = key.z + stick.z

  /* Clamp to a disc so diagonal is not faster than orthogonal. */
  const len = Math.hypot(x, z)
  if (len > 1) {
    x /= len
    z /= len
  }

  input.moveX = x
  input.moveZ = z
  input.moving = Math.hypot(x, z) > 0.02
}

/**
 * Binds every listener. Returns the teardown.
 *
 * `blocked()` lets the caller suspend movement without unbinding — while a
 * panel is open, WASD should type nothing and move nothing, but the moment
 * the panel closes the same keys must work again without a rebind.
 */
export function bindInput(opts: {
  element: HTMLElement
  blocked: () => boolean
  onInteract: () => void
}) {
  const { element, blocked, onInteract } = opts

  const onKeyDown = (e: KeyboardEvent) => {
    /* Never swallow a shortcut, and never fight a real text field. */
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const target = e.target as HTMLElement | null
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return

    if (CONSUMED.has(e.code)) e.preventDefault()

    if (blocked()) return
    held.add(e.code)
    if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') onInteract()
    syncMove()
  }

  const onKeyUp = (e: KeyboardEvent) => {
    held.delete(e.code)
    syncMove()
  }

  /* A key held while the tab loses focus would otherwise stay held forever. */
  const onBlur = () => {
    held.clear()
    syncMove()
  }

  let dragging = false
  let lastX = 0
  let lastY = 0

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || blocked()) return
    dragging = true
    lastX = e.clientX
    lastY = e.clientY
    element.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: PointerEvent) => {
    input.px = e.clientX
    input.py = e.clientY
    input.nx = (e.clientX / window.innerWidth) * 2 - 1
    input.ny = (e.clientY / window.innerHeight) * 2 - 1

    if (!dragging) return
    input.yaw -= (e.clientX - lastX) * 0.005
    input.pitch = clamp(input.pitch + (e.clientY - lastY) * 0.003, PITCH_MIN, PITCH_MAX)
    lastX = e.clientX
    lastY = e.clientY
  }

  const endDrag = (e: PointerEvent) => {
    dragging = false
    element.releasePointerCapture?.(e.pointerId)
  }

  element.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerup', endDrag)
  window.addEventListener('pointercancel', endDrag)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onBlur)

  return () => {
    element.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', endDrag)
    window.removeEventListener('pointercancel', endDrag)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', onBlur)
    held.clear()
    stick = { x: 0, z: 0 }
    syncMove()
  }
}

/** Clears held state — called when a panel takes over. */
export function releaseControls() {
  held.clear()
  stick = { x: 0, z: 0 }
  syncMove()
}
