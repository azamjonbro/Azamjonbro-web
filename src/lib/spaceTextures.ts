import * as THREE from 'three'

/**
 * Every texture in the world is drawn on a canvas at runtime.
 *
 * No image assets, no CDN, nothing to wait on over the network, and the
 * palette lives in code next to everything else that uses it. Each factory
 * returns a fresh texture; `useProceduralTexture` disposes it on unmount.
 */

function canvas2d(width: number, height: number) {
  const el = document.createElement('canvas')
  el.width = width
  el.height = height
  const ctx = el.getContext('2d')!
  return { el, ctx }
}

function finish(el: HTMLCanvasElement, srgb = true) {
  const texture = new THREE.CanvasTexture(el)
  texture.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}

/** A soft round dot — the sprite every star is drawn with. */
export function createStarSprite() {
  const { el, ctx } = canvas2d(64, 64)
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.75)')
  g.addColorStop(0.55, 'rgba(190,215,255,0.18)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return finish(el)
}

/**
 * Brushed graphite for the station's plating. Kept genuinely dark — a metal
 * that reads as grey in a lit room reads as white against space.
 */
export function createPlatingTexture(size = 1024) {
  const { el, ctx } = canvas2d(size, size)

  ctx.fillStyle = '#14161d'
  ctx.fillRect(0, 0, size, size)

  /* Fine horizontal brushing. */
  for (let i = 0; i < 5200; i++) {
    const y = Math.random() * size
    const w = 30 + Math.random() * 200
    const a = 0.012 + Math.random() * 0.03
    ctx.strokeStyle = Math.random() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a * 1.4})`
    ctx.lineWidth = 0.6 + Math.random()
    ctx.beginPath()
    ctx.moveTo(Math.random() * size, y)
    ctx.lineTo(Math.random() * size + w, y)
    ctx.stroke()
  }

  /* Panel seams — the thing that makes a surface read as built. */
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'
  ctx.lineWidth = 2
  const cell = size / 8
  for (let i = 1; i < 8; i++) {
    ctx.beginPath()
    ctx.moveTo(i * cell, 0)
    ctx.lineTo(i * cell, size)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i * cell)
    ctx.lineTo(size, i * cell)
    ctx.stroke()
  }

  /* A few rivet rows, sparse enough to be noticed rather than seen. */
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 20; j++) {
      ctx.beginPath()
      ctx.arc(i * cell + 12, j * (size / 20) + 10, 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const texture = finish(el)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}

/** Matching roughness variation, so the plating is not uniformly polished. */
export function createPlatingRoughness(size = 512) {
  const { el, ctx } = canvas2d(size, size)
  const img = ctx.createImageData(size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 150 + Math.random() * 70
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const texture = finish(el, false)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}

/** The floor's technical grid, drawn once and tiled across the deck. */
export function createDeckGrid(size = 512) {
  const { el, ctx } = canvas2d(size, size)

  ctx.fillStyle = '#0a0c12'
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = 'rgba(120,170,220,0.10)'
  ctx.lineWidth = 1.5
  const step = size / 4
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath(); ctx.moveTo(i * step, 0); ctx.lineTo(i * step, size); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i * step); ctx.lineTo(size, i * step); ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(120,170,220,0.045)'
  ctx.lineWidth = 1
  const fine = size / 16
  for (let i = 0; i <= 16; i++) {
    ctx.beginPath(); ctx.moveTo(i * fine, 0); ctx.lineTo(i * fine, size); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i * fine); ctx.lineTo(size, i * fine); ctx.stroke()
  }

  /* Corner brackets, so a tile reads as a deck plate rather than graph paper. */
  ctx.strokeStyle = 'rgba(140,200,255,0.20)'
  ctx.lineWidth = 2.5
  const b = 22
  for (const [x, y, dx, dy] of [
    [4, 4, 1, 1], [size - 4, 4, -1, 1], [4, size - 4, 1, -1], [size - 4, size - 4, -1, -1],
  ]) {
    ctx.beginPath()
    ctx.moveTo(x + b * dx, y); ctx.lineTo(x, y); ctx.lineTo(x, y + b * dy)
    ctx.stroke()
  }

  const texture = finish(el)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}

/**
 * A hologram's surface: scanlines and a faint grid, drawn on transparent
 * black so it can be added over whatever is behind it.
 */
export function createHoloSurface(width = 512, height = 512, tint = '#5ad1ff') {
  const { el, ctx } = canvas2d(width, height)

  ctx.strokeStyle = `${tint}22`
  ctx.lineWidth = 1
  for (let y = 0; y < height; y += 4) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
  }

  ctx.strokeStyle = `${tint}18`
  for (let x = 0; x < width; x += 32) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
  }

  const texture = finish(el)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}

/**
 * The planet, as a single equirectangular map: banded cloud belts plus a
 * terminator. Cheap, and at this distance indistinguishable from something
 * far more expensive.
 */
export function createPlanetTexture(width = 1024, height = 512) {
  const { el, ctx } = canvas2d(width, height)

  ctx.fillStyle = '#0d1622'
  ctx.fillRect(0, 0, width, height)

  /* Latitude belts. */
  for (let y = 0; y < height; y++) {
    const t = y / height
    const band = Math.sin(t * Math.PI * 7) * 0.5 + 0.5
    const shade = 14 + band * 26 + Math.sin(t * Math.PI * 23) * 5
    ctx.fillStyle = `rgb(${Math.round(shade * 0.75)}, ${Math.round(shade * 0.95)}, ${Math.round(shade * 1.5)})`
    ctx.fillRect(0, y, width, 1)
  }

  /* Storm swirls, elongated the way banded atmospheres actually shear. */
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const rx = 20 + Math.random() * 110
    const ry = rx * (0.12 + Math.random() * 0.16)
    const a = 0.03 + Math.random() * 0.07
    ctx.fillStyle = Math.random() > 0.45 ? `rgba(150,190,240,${a})` : `rgba(6,10,18,${a * 1.5})`
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  /* Poles run cooler and brighter. */
  const cap = ctx.createLinearGradient(0, 0, 0, height)
  cap.addColorStop(0, 'rgba(180,210,255,0.30)')
  cap.addColorStop(0.16, 'rgba(180,210,255,0)')
  cap.addColorStop(0.84, 'rgba(180,210,255,0)')
  cap.addColorStop(1, 'rgba(180,210,255,0.30)')
  ctx.fillStyle = cap
  ctx.fillRect(0, 0, width, height)

  return finish(el)
}

/** Very faint volumetric haze, used on two large billboards behind the station. */
export function createNebula(size = 512) {
  const { el, ctx } = canvas2d(size, size)

  for (let i = 0; i < 26; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 60 + Math.random() * 190
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    const hue = Math.random() > 0.5 ? '90,140,220' : '150,110,220'
    g.addColorStop(0, `rgba(${hue},0.055)`)
    g.addColorStop(1, `rgba(${hue},0)`)
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }

  return finish(el)
}

/* ─── IN-WORLD TYPOGRAPHY ─────────────────────────────────────── */

/**
 * Labels are drawn into canvases rather than rendered with an SDF text
 * library.
 *
 * A text library would need a font file parsed at runtime and would still
 * fall back to a CDN face by default. A canvas already has the page's fonts,
 * gives exact control over the layout, and costs one texture per sign that
 * never changes.
 */
const DISPLAY = '"Space Grotesk", system-ui, sans-serif'
const MONO = 'ui-monospace, "SF Mono", Menlo, monospace'

/** Letter-spaced text, which canvas has no native support for. */
function tracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  align: 'left' | 'center' = 'left',
) {
  const chars = [...text]
  const width =
    chars.reduce((sum, c) => sum + ctx.measureText(c).width, 0) + spacing * (chars.length - 1)
  let cursor = align === 'center' ? x - width / 2 : x

  for (const char of chars) {
    ctx.fillText(char, cursor, y)
    cursor += ctx.measureText(char).width + spacing
  }
  return width
}

/** The sign standing on a destination pad. */
export function createZoneSign(label: string, caption: string, accent: string) {
  const w = 512
  const h = 256
  const { el, ctx } = canvas2d(w, h)

  ctx.clearRect(0, 0, w, h)

  ctx.strokeStyle = `${accent}30`
  ctx.lineWidth = 1
  for (let y = 0; y < h; y += 4) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }

  ctx.fillStyle = accent
  ctx.font = `500 62px ${DISPLAY}`
  ctx.textBaseline = 'alphabetic'
  tracked(ctx, label, w / 2, 128, 5, 'center')

  ctx.fillStyle = 'rgba(220,235,255,0.55)'
  ctx.font = `400 21px ${MONO}`
  tracked(ctx, caption, w / 2, 168, 3.5, 'center')

  ctx.strokeStyle = `${accent}cc`
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(w / 2 - 44, 190); ctx.lineTo(w / 2 + 44, 190); ctx.stroke()

  return finish(el)
}

/** The plate on a project monolith, above the screenshot. */
export function createExhibitPlate(
  index: string,
  name: string,
  category: string,
  stack: string[],
  accent: string,
) {
  const w = 768
  const h = 384
  const { el, ctx } = canvas2d(w, h)

  ctx.clearRect(0, 0, w, h)

  ctx.strokeStyle = `${accent}22`
  ctx.lineWidth = 1
  for (let y = 0; y < h; y += 4) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }

  const pad = 46

  ctx.fillStyle = accent
  ctx.font = `400 26px ${MONO}`
  tracked(ctx, `PROJECT ${index}`, pad, 66, 4)

  ctx.strokeStyle = `${accent}99`
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(pad, 90); ctx.lineTo(w - pad, 90); ctx.stroke()

  /* Titles shrink to fit rather than wrapping — one long name should not
     push the category off the plate. */
  let size = 64
  ctx.font = `500 ${size}px ${DISPLAY}`
  while (ctx.measureText(name).width > w - pad * 2 && size > 30) {
    size -= 3
    ctx.font = `500 ${size}px ${DISPLAY}`
  }
  ctx.fillStyle = '#eef4ff'
  ctx.fillText(name, pad, 168)

  ctx.fillStyle = 'rgba(200,220,245,0.62)'
  ctx.font = `400 23px ${MONO}`
  tracked(ctx, category.toUpperCase(), pad, 212, 3)

  /* Stack chips, wrapped across two rows at most. */
  ctx.font = `400 20px ${MONO}`
  let x = pad
  let y = 268
  for (const tech of stack) {
    const tw = ctx.measureText(tech).width + 26
    if (x + tw > w - pad) {
      x = pad
      y += 44
      if (y > h - 40) break
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(x, y - 24, tw, 36, 8)
    ctx.stroke()
    ctx.fillStyle = 'rgba(226,238,255,0.86)'
    ctx.fillText(tech, x + 13, y)
    x += tw + 10
  }

  return finish(el)
}

/** A short holographic caption, used for the lab and the contact terminal. */
export function createCaption(lines: string[], accent: string, sizes: number[] = []) {
  const w = 512
  const h = 256
  const { el, ctx } = canvas2d(w, h)

  ctx.clearRect(0, 0, w, h)
  ctx.textBaseline = 'alphabetic'

  let y = 90
  lines.forEach((line, i) => {
    const size = sizes[i] ?? (i === 0 ? 52 : 24)
    const mono = i > 0
    ctx.font = `${mono ? 400 : 500} ${size}px ${mono ? MONO : DISPLAY}`
    ctx.fillStyle = i === 0 ? accent : 'rgba(214,231,255,0.6)'
    tracked(ctx, line, w / 2, y, mono ? 3 : 4, 'center')
    y += size + 22
  })

  return finish(el)
}
