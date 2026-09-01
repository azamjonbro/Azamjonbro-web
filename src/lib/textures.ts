import * as THREE from 'three'

function canvas2d(width: number, height: number) {
  const el = document.createElement('canvas')
  el.width = width
  el.height = height
  return { el, ctx: el.getContext('2d')! }
}

function finish(el: HTMLCanvasElement, srgb = true) {
  const tex = new THREE.CanvasTexture(el)
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

/* ─── MARBLE DESK TOP ─────────────────────────────────────────── */
export function createMarbleTexture() {
  const { el, ctx } = canvas2d(1024, 512)

  ctx.fillStyle = '#e9e6df'
  ctx.fillRect(0, 0, el.width, el.height)

  // Broad tonal clouding
  for (let i = 0; i < 46; i++) {
    const rx = Math.random() * el.width
    const ry = Math.random() * el.height
    const rad = 60 + Math.random() * 160
    const grad = ctx.createRadialGradient(rx, ry, 8, rx, ry, rad)
    grad.addColorStop(0, 'rgba(196, 191, 182, 0.28)')
    grad.addColorStop(1, 'rgba(233, 230, 223, 0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(rx, ry, rad, 0, Math.PI * 2)
    ctx.fill()
  }

  // Primary veins
  for (let v = 0; v < 14; v++) {
    ctx.lineWidth = 1.2 + Math.random() * 2.2
    ctx.strokeStyle = v % 2 === 0 ? 'rgba(88, 84, 80, 0.34)' : 'rgba(126, 118, 108, 0.22)'
    ctx.beginPath()
    let x = Math.random() * el.width * 0.35
    let y = (v * el.height) / 12 + (Math.random() - 0.5) * 46
    ctx.moveTo(x, y)
    for (let seg = 0; seg < 7; seg++) {
      const c1x = x + 50 + Math.random() * 90
      const c1y = y + (Math.random() - 0.5) * 100
      const c2x = c1x + 50 + Math.random() * 90
      const c2y = y + (Math.random() - 0.5) * 100
      x = c2x + 50 + Math.random() * 90
      y = c2y + (Math.random() - 0.5) * 56
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x, y)
    }
    ctx.stroke()
  }

  // Hairline veins
  ctx.lineWidth = 0.5
  ctx.strokeStyle = 'rgba(120, 112, 102, 0.18)'
  for (let v = 0; v < 40; v++) {
    const x = Math.random() * el.width
    const y = Math.random() * el.height
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + 30 + Math.random() * 90, y + (Math.random() - 0.5) * 70)
    ctx.stroke()
  }

  const tex = finish(el)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

/* ─── ROUGHNESS MAP DERIVED FROM NOISE (for marble sheen breakup) ─ */
export function createNoiseRoughness(base = 140, spread = 60) {
  const { el, ctx } = canvas2d(512, 512)
  const img = ctx.createImageData(el.width, el.height)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = base + (Math.random() - 0.5) * spread
    img.data[i] = img.data[i + 1] = img.data[i + 2] = n
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const tex = finish(el, false)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 4)
  return tex
}

/* ─── NIGHT CITY SEEN THROUGH THE WINDOW ──────────────────────── */
export function createCityTexture() {
  const { el, ctx } = canvas2d(1024, 768)

  const sky = ctx.createLinearGradient(0, 0, 0, el.height)
  sky.addColorStop(0, '#05070f')
  sky.addColorStop(0.55, '#0b1024')
  sky.addColorStop(0.82, '#1b2144')
  sky.addColorStop(1, '#2a2352')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, el.width, el.height)

  // Distant haze glow near the horizon
  const haze = ctx.createRadialGradient(el.width * 0.6, el.height * 0.92, 20, el.width * 0.6, el.height * 0.92, 520)
  haze.addColorStop(0, 'rgba(120, 110, 220, 0.30)')
  haze.addColorStop(1, 'rgba(120, 110, 220, 0)')
  ctx.fillStyle = haze
  ctx.fillRect(0, 0, el.width, el.height)

  // Three depth layers of towers, near ones darker and taller
  const layers = [
    { count: 26, minH: 130, maxH: 300, shade: '#0a0d1c', alpha: 0.55, win: 0.18 },
    { count: 20, minH: 220, maxH: 430, shade: '#080a16', alpha: 0.75, win: 0.26 },
    { count: 14, minH: 300, maxH: 560, shade: '#05060f', alpha: 1, win: 0.34 },
  ]

  for (const layer of layers) {
    for (let i = 0; i < layer.count; i++) {
      const w = 34 + Math.random() * 78
      const h = layer.minH + Math.random() * (layer.maxH - layer.minH)
      const x = Math.random() * (el.width + 80) - 40
      const y = el.height - h

      ctx.globalAlpha = layer.alpha
      ctx.fillStyle = layer.shade
      ctx.fillRect(x, y, w, h)
      ctx.globalAlpha = 1

      // Lit windows
      const cols = Math.max(2, Math.floor(w / 13))
      const rows = Math.floor(h / 17)
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (Math.random() > layer.win) continue
          const warm = Math.random()
          ctx.fillStyle =
            warm > 0.78
              ? 'rgba(150, 200, 255, 0.95)'
              : warm > 0.5
                ? 'rgba(255, 214, 150, 0.92)'
                : 'rgba(255, 186, 96, 0.78)'
          ctx.fillRect(x + 5 + c * 13, y + 8 + r * 17, 5, 7)
        }
      }
    }
  }

  // A few aircraft-warning beacons
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * el.width
    const y = el.height * (0.25 + Math.random() * 0.35)
    const g = ctx.createRadialGradient(x, y, 0, x, y, 9)
    g.addColorStop(0, 'rgba(255, 90, 90, 0.95)')
    g.addColorStop(1, 'rgba(255, 90, 90, 0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, 9, 0, Math.PI * 2)
    ctx.fill()
  }

  return finish(el)
}

/* ─── PERSIAN-STYLE RUG ───────────────────────────────────────── */
export function createRugTexture() {
  const { el, ctx } = canvas2d(512, 512)

  ctx.fillStyle = '#141220'
  ctx.fillRect(0, 0, el.width, el.height)

  ctx.strokeStyle = 'rgba(120, 96, 190, 0.30)'
  ctx.lineWidth = 6
  ctx.strokeRect(24, 24, el.width - 48, el.height - 48)
  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(150, 124, 220, 0.22)'
  ctx.strokeRect(42, 42, el.width - 84, el.height - 84)

  // Repeating diamond motif
  ctx.strokeStyle = 'rgba(132, 108, 200, 0.20)'
  ctx.lineWidth = 1.6
  for (let x = 76; x < el.width - 60; x += 56) {
    for (let y = 76; y < el.height - 60; y += 56) {
      ctx.beginPath()
      ctx.moveTo(x, y - 18)
      ctx.lineTo(x + 18, y)
      ctx.lineTo(x, y + 18)
      ctx.lineTo(x - 18, y)
      ctx.closePath()
      ctx.stroke()
    }
  }

  // Fibre noise so it does not read as a printed plane
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.035})`
    ctx.fillRect(Math.random() * el.width, Math.random() * el.height, 1.5, 1.5)
  }

  return finish(el)
}

/* ─── WOVEN FABRIC (curtains, chair) ──────────────────────────── */
export function createFabricTexture(tint = '#16264d') {
  const { el, ctx } = canvas2d(256, 256)
  ctx.fillStyle = tint
  ctx.fillRect(0, 0, el.width, el.height)

  for (let y = 0; y < el.height; y += 3) {
    ctx.fillStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.05})`
    ctx.fillRect(0, y, el.width, 1)
  }
  for (let x = 0; x < el.width; x += 3) {
    ctx.fillStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.03})`
    ctx.fillRect(x, 0, 1, el.height)
  }

  const tex = finish(el)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 6)
  return tex
}

/* ─── MECHANICAL KEYBOARD DECK ────────────────────────────────── */
export function createKeycapTexture() {
  const { el, ctx } = canvas2d(1024, 384)

  ctx.fillStyle = '#0e0f14'
  ctx.fillRect(0, 0, el.width, el.height)

  const rows = 5
  const cols = 15
  const padX = 18
  const padY = 16
  const gap = 5
  const kw = (el.width - padX * 2 - gap * (cols - 1)) / cols
  const kh = (el.height - padY * 2 - gap * (rows - 1)) / rows

  // Rainbow-per-column RGB lighting, as in the reference photo
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = padX + c * (kw + gap)
      const y = padY + r * (kh + gap)
      const hue = (c / cols) * 300 + r * 6

      // Backlight bleed under the cap
      ctx.fillStyle = `hsla(${hue}, 90%, 60%, 0.55)`
      ctx.fillRect(x - 2, y - 2, kw + 4, kh + 4)

      // Cap
      const g = ctx.createLinearGradient(x, y, x, y + kh)
      g.addColorStop(0, '#26272f')
      g.addColorStop(1, '#15161c')
      ctx.fillStyle = g
      ctx.fillRect(x, y, kw, kh)

      // Legend
      ctx.fillStyle = `hsla(${hue}, 95%, 78%, 0.85)`
      ctx.font = `${Math.floor(kh * 0.34)}px ui-monospace, monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[(r * cols + c) % 26], x + kw / 2, y + kh / 2)
    }
  }

  return finish(el)
}

/* ─── MACBOOK DESKTOP ─────────────────────────────────────────── */
export function createMacBookTexture() {
  const { el, ctx } = canvas2d(1024, 640)

  const bg = ctx.createLinearGradient(0, 0, el.width, el.height)
  bg.addColorStop(0, '#221a3f')
  bg.addColorStop(0.5, '#3b2168')
  bg.addColorStop(1, '#101a3a')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, el.width, el.height)

  const glow = ctx.createRadialGradient(el.width * 0.7, el.height * 0.3, 20, el.width * 0.7, el.height * 0.3, 460)
  glow.addColorStop(0, 'rgba(168, 130, 255, 0.55)')
  glow.addColorStop(1, 'rgba(168, 130, 255, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, el.width, el.height)

  // Menu bar
  ctx.fillStyle = 'rgba(10, 10, 16, 0.55)'
  ctx.fillRect(0, 0, el.width, 30)
  ctx.fillStyle = 'rgba(255,255,255,0.82)'
  ctx.font = '16px ui-sans-serif, system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('Terminal   File   Edit   View   Window   Help', 44, 15)
  ctx.textAlign = 'right'
  ctx.fillText('22:18', el.width - 24, 15)

  // Terminal window
  const wx = 120
  const wy = 110
  const ww = el.width - 240
  const wh = el.height - 250
  ctx.fillStyle = 'rgba(8, 9, 14, 0.88)'
  ctx.fillRect(wx, wy, ww, wh)
  ctx.fillStyle = 'rgba(28, 30, 42, 0.95)'
  ctx.fillRect(wx, wy, ww, 30)
  const dots = ['#ff5f57', '#febc2e', '#28c840']
  dots.forEach((c, i) => {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(wx + 20 + i * 20, wy + 15, 6, 0, Math.PI * 2)
    ctx.fill()
  })

  const lines: [string, string][] = [
    ['#7c80a0', 'azamjonbro@macbook-air ~ %'],
    ['#c8ccdd', ' npm run build'],
    ['', ''],
    ['#a78bfa', 'vite v8.2.0 building for production...'],
    ['#7c8092', '✓ 412 modules transformed'],
    ['#22c55e', '✓ built in 3.41s'],
    ['', ''],
    ['#7c80a0', 'azamjonbro@macbook-air ~ %'],
    ['#c8ccdd', ' docker compose up -d'],
    ['#38bdf8', '✔ Container hadiya-api   Started'],
    ['#38bdf8', '✔ Container hadiya-db    Started'],
  ]
  ctx.font = '17px ui-monospace, monospace'
  ctx.textAlign = 'left'
  lines.forEach(([color, text], i) => {
    if (!text) return
    ctx.fillStyle = color
    ctx.fillText(text, wx + 22, wy + 58 + i * 25)
  })

  // Dock
  ctx.fillStyle = 'rgba(255,255,255,0.10)'
  ctx.fillRect(el.width / 2 - 200, el.height - 68, 400, 56)
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = `hsla(${250 + i * 14}, 70%, ${58 + i * 2}%, 0.9)`
    ctx.fillRect(el.width / 2 - 186 + i * 54, el.height - 58, 40, 40)
  }

  return finish(el)
}

/* ─── WALL DISPLAY PANELS ─────────────────────────────────────── */
interface WallDisplaySpec {
  title: string
  subtitle: string
  meta: string
  accent: string
}

const wallSpecs: Record<string, WallDisplaySpec> = {
  swisswatch: {
    title: 'SwissWatch',
    subtitle: 'Luxury Watch\nE-Commerce Platform',
    meta: 'React · Node.js · MongoDB',
    accent: '#c8a86b',
  },
  hadiya: {
    title: 'Hadiya',
    subtitle: 'AI-Powered\nPOS System',
    meta: 'Vue · Node.js · MongoDB',
    accent: '#a78bfa',
  },
  ctf: {
    title: 'CTF Platform',
    subtitle: 'Cybersecurity\nChallenge Platform',
    meta: 'React · Node.js · PostgreSQL',
    accent: '#38bdf8',
  },
}

export function createWallDisplayTexture(id: string) {
  const spec = wallSpecs[id] ?? wallSpecs.swisswatch
  const { el, ctx } = canvas2d(1024, 590)

  ctx.fillStyle = '#07080e'
  ctx.fillRect(0, 0, el.width, el.height)

  // Accent wash from the right, where the artwork sits
  const wash = ctx.createRadialGradient(el.width * 0.76, el.height * 0.5, 20, el.width * 0.76, el.height * 0.5, 480)
  wash.addColorStop(0, `${spec.accent}55`)
  wash.addColorStop(0.55, `${spec.accent}18`)
  wash.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = wash
  ctx.fillRect(0, 0, el.width, el.height)

  // Faint technical grid
  ctx.strokeStyle = 'rgba(255,255,255,0.035)'
  ctx.lineWidth = 1
  for (let x = 0; x < el.width; x += 48) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, el.height)
    ctx.stroke()
  }
  for (let y = 0; y < el.height; y += 48) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(el.width, y)
    ctx.stroke()
  }

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 74px "Space Grotesk", ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(spec.title, 62, 168)

  ctx.fillStyle = 'rgba(226, 232, 240, 0.72)'
  ctx.font = '34px ui-sans-serif, system-ui, sans-serif'
  spec.subtitle.split('\n').forEach((line, i) => {
    ctx.fillText(line, 64, 232 + i * 44)
  })

  ctx.fillStyle = spec.accent
  ctx.font = '600 25px ui-monospace, monospace'
  ctx.fillText(spec.meta, 64, 392)

  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = '20px ui-monospace, monospace'
  ctx.fillText('CLICK TO OPEN', 64, 460)

  // Right-hand artwork
  const cx = el.width * 0.78
  const cy = el.height * 0.5
  ctx.save()
  ctx.strokeStyle = spec.accent
  ctx.lineWidth = 3

  if (id === 'swisswatch') {
    ctx.globalAlpha = 0.9
    ctx.beginPath()
    ctx.arc(cx, cy, 128, 0, Math.PI * 2)
    ctx.stroke()
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.arc(cx, cy, 118, 0, Math.PI * 2)
    ctx.globalAlpha = 0.18
    ctx.stroke()
    ctx.globalAlpha = 0.9
    ctx.lineWidth = 4
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a) * 100, cy + Math.sin(a) * 100)
      ctx.lineTo(cx + Math.cos(a) * 114, cy + Math.sin(a) * 114)
      ctx.stroke()
    }
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + 6, cy - 78)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + 56, cy + 30)
    ctx.stroke()
  } else if (id === 'hadiya') {
    ctx.globalAlpha = 0.85
    for (let ring = 0; ring < 3; ring++) {
      ctx.beginPath()
      ctx.arc(cx, cy, 60 + ring * 34, 0, Math.PI * 2)
      ctx.globalAlpha = 0.4 - ring * 0.1
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    ctx.fillStyle = spec.accent
    ctx.font = 'bold 110px "Space Grotesk", ui-sans-serif, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('AI', cx, cy + 38)
    ctx.textAlign = 'left'
  } else {
    ctx.globalAlpha = 0.9
    // Radiating capture-the-flag burst
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2
      ctx.globalAlpha = 0.15 + (i % 3) * 0.2
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a) * 26, cy + Math.sin(a) * 26)
      ctx.lineTo(cx + Math.cos(a) * (86 + (i % 4) * 30), cy + Math.sin(a) * (86 + (i % 4) * 30))
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(cx, cy, 16, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  // Scanline overlay so it reads as a screen, not a poster
  ctx.fillStyle = 'rgba(0,0,0,0.16)'
  for (let y = 0; y < el.height; y += 4) ctx.fillRect(0, y, el.width, 1)

  return finish(el)
}

/* ─── DIGITAL CLOCK READOUT ───────────────────────────────────── */
export function createClockTexture(time = '22:18') {
  const { el, ctx } = canvas2d(512, 192)

  ctx.fillStyle = '#05050a'
  ctx.fillRect(0, 0, el.width, el.height)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Unlit segments behind the live ones, as on a real VFD panel
  ctx.font = 'bold 128px "Space Grotesk", ui-monospace, monospace'
  ctx.fillStyle = 'rgba(167, 139, 250, 0.10)'
  ctx.fillText('88:88', el.width / 2, el.height / 2 + 4)

  ctx.shadowColor = '#a78bfa'
  ctx.shadowBlur = 26
  ctx.fillStyle = '#ddd2ff'
  ctx.fillText(time, el.width / 2, el.height / 2 + 4)
  ctx.shadowBlur = 0

  ctx.font = '600 22px ui-sans-serif, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(167, 139, 250, 0.55)'
  ctx.fillText('PM', el.width / 2 + 186, el.height / 2 + 34)

  return finish(el)
}
