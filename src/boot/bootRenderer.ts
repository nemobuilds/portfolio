import { ditherPaths, LEVELS } from '../tiles/dither'
import { clamp, smoothstep } from '../tiles/flip'
import { bootLum, hash2, levelOf } from '../tiles/shimmer'
import {
  atlasCell,
  atlasSize,
  bucketColor,
  deviceRect,
  HUE_BUCKETS,
  hueBucket,
  reuseCanvas,
  type PixelRect,
} from './bootBuffers'
import { BOOT_TIMING, type BootPhase } from './bootProgress'

// Ported from docs/superpowers/specs/reef-logbook-animations/boot-sequence-v7.html

export type BootRenderer = {
  setProgress(f: number): void
  play(onDone: () => void): void
  skip(): void
  destroy(): void
}

const NAME = 'John Rogee'
const BG = '#05080F'
const PLATE = '#2C345C'
const LABEL_COLOR = '#C3C7D2'
const NAME_FONT = '"Talina", "Instrument Serif", serif'
const SERIF_FONT = '"Instrument Serif", Georgia, serif'
const UI_FONT = '"Inter Tight Variable", "Inter Tight", system-ui, sans-serif'

const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeIn = (t: number) => t * t * t

function offscreen(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

export function createBootRenderer(canvas: HTMLCanvasElement, opts: { reducedMotion: boolean }): BootRenderer {
  const ctx = canvas.getContext('2d')
  const still = opts.reducedMotion

  let phase: BootPhase = 'fill'
  let phaseStart = 0
  let target = 0
  let level = 0
  let playing = false
  let onDone: (() => void) | undefined
  let raf = 0
  let lastNow = 0
  let fontsReady = false
  let nameStart = 0
  let destroyed = false
  let fadeTimer: ReturnType<typeof setTimeout> | undefined

  // layout state
  let W = 0, H = 0, dpr = 1, tile = 10, cols = 0, rows = 0, fontSize = 0
  // Every (shade level, colour bucket) tile drawn once; tiles are copied from here each frame.
  let atlas: HTMLCanvasElement | undefined
  let atlasKey = ''
  let cell = 10
  // Atlas source position per sprite, indexed by level * HUE_BUCKETS + bucket.
  const atlasSX = new Float64Array(LEVELS * HUE_BUCKETS)
  const atlasSY = new Float64Array(LEVELS * HUE_BUCKETS)
  // Per-tile values that only change with the layout.
  let tileH1 = new Float64Array(0), tileH2 = new Float64Array(0), tileDist = new Float64Array(0), tileCalm = new Float64Array(0)
  let nameBox = { w: 0, top: 0, bottom: 0 }
  // Device-pixel box around the name. The letter mask, plate and water buffers cover only this.
  let nameRect: PixelRect = { x: 0, y: 0, w: 1, h: 1 }
  let glyph: HTMLCanvasElement | undefined
  let plate: HTMLCanvasElement | undefined
  let water: HTMLCanvasElement | undefined

  const nameFont = () => `400 ${fontSize}px ${NAME_FONT}`

  function layout() {
    if (!ctx) return
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = canvas.clientWidth || window.innerWidth
    H = canvas.clientHeight || window.innerHeight
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    tile = Math.max(10, Math.round(W / 78))
    cols = Math.ceil(W / tile) + 1
    rows = Math.ceil(H / tile) + 1
    buildAtlas()

    // The name: min(12% H, 7.5% W), never wider than 42% of the screen.
    fontSize = Math.min(H * 0.12, W * 0.075)
    ctx.font = nameFont()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    let mm = ctx.measureText(NAME)
    if (mm.width > W * 0.42) {
      fontSize *= (W * 0.42) / mm.width
      ctx.font = nameFont()
      mm = ctx.measureText(NAME)
    }
    const ny = H / 2 - fontSize * 0.08
    nameBox = { w: mm.width, top: ny - mm.actualBoundingBoxAscent, bottom: ny + mm.actualBoundingBoxDescent }

    const r = deviceRect(
      { left: W / 2 - mm.actualBoundingBoxLeft, right: W / 2 + mm.actualBoundingBoxRight, top: nameBox.top, bottom: nameBox.bottom },
      4 + fontSize * 0.1,
      dpr,
    )
    nameRect = r

    // Name-sized letter mask, the slate plate cut from it, and the water buffer.
    // Each is made once and again only when the name box changes size.
    glyph = reuseCanvas(glyph, r.w, r.h, offscreen)
    const g = glyph.getContext('2d')!
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.clearRect(0, 0, r.w, r.h)
    g.setTransform(dpr, 0, 0, dpr, -r.x, -r.y)
    g.font = nameFont()
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillStyle = '#fff'
    g.fillText(NAME, W / 2, ny)
    plate = reuseCanvas(plate, r.w, r.h, offscreen)
    const pc = plate.getContext('2d')!
    pc.globalCompositeOperation = 'source-over'
    pc.clearRect(0, 0, r.w, r.h)
    pc.drawImage(glyph, 0, 0)
    pc.globalCompositeOperation = 'source-in'
    pc.fillStyle = PLATE
    pc.fillRect(0, 0, r.w, r.h)
    water = reuseCanvas(water, r.w, r.h, offscreen)

    // Calm zone: tiles near the name stay dim so the name reads.
    const n = cols * rows
    const cx = W / 2, cy = H / 2
    const calmW = nameBox.w * 0.62 || 1
    const calmH = fontSize * 1.5 || 1
    tileH1 = new Float64Array(n)
    tileH2 = new Float64Array(n)
    tileDist = new Float64Array(n)
    tileCalm = new Float64Array(n)
    for (let j = 0, q = 0; j < rows; j++)
      for (let i = 0; i < cols; i++, q++) {
        const x = i * tile + tile / 2, y = j * tile + tile / 2
        tileH1[q] = hash2(i, j)
        tileH2[q] = hash2(j + 7, i + 3)
        tileDist[q] = Math.hypot(x - cx, y - cy) / tile
        tileCalm[q] = 0.25 + 0.75 * smoothstep(clamp(Math.hypot((x - cx) / calmW, (y - cy) / calmH) - 0.55, 0, 1))
      }
  }

  // One opaque sprite per (level, bucket), at device resolution and centred in its cell
  // on the same sub-pixel grid as the screen tiles. The tile's alpha is applied with
  // globalAlpha when it is drawn, so alpha needs no buckets.
  function buildAtlas() {
    cell = Math.max(1, Math.round(tile * dpr))
    const key = `${tile}@${dpr}`
    if (atlas && atlasKey === key) return
    const size = atlasSize(LEVELS, cell)
    atlas = reuseCanvas(atlas, size.w, size.h, offscreen)
    atlasKey = key
    const a = atlas.getContext('2d')!
    a.setTransform(1, 0, 0, 1, 0, 0)
    a.clearRect(0, 0, size.w, size.h)
    const paths = ditherPaths(tile)
    const s = cell / tile
    for (let b = 0; b < HUE_BUCKETS; b++) {
      a.fillStyle = bucketColor(b)
      for (let l = 0; l < LEVELS; l++) {
        const { sx, sy } = atlasCell(l, b, cell)
        atlasSX[l * HUE_BUCKETS + b] = sx
        atlasSY[l * HUE_BUCKETS + b] = sy
        a.setTransform(s, 0, 0, s, sx + cell / 2, sy + cell / 2)
        a.fill(paths[l])
      }
    }
  }

  // White water inside the letters, under a gently moving surface.
  function drawWater(lvl: number, t: number) {
    const r = nameRect
    const w = water!.getContext('2d')!
    w.setTransform(1, 0, 0, 1, 0, 0)
    w.globalCompositeOperation = 'source-over'
    w.clearRect(0, 0, r.w, r.h)
    w.setTransform(dpr, 0, 0, dpr, -r.x, -r.y)
    const span = nameBox.bottom - nameBox.top + fontSize * 0.2
    const base = nameBox.bottom + fontSize * 0.1 - lvl * (span + 6)
    const amp = still ? 0 : lvl < 1 ? fontSize * 0.035 : fontSize * 0.012
    // Only the surface samples over the buffer. They are the same points as a
    // full-width surface (every 4 px from 0), so the shape is the same.
    const last = Math.floor((W + 4) / 4) * 4
    const x0 = Math.max(0, Math.floor(r.x / dpr / 4) * 4 - 4)
    const x1 = Math.min(last, Math.ceil((r.x + r.w) / dpr / 4) * 4 + 4)
    w.beginPath()
    w.moveTo(x0, H)
    for (let x = x0; x <= x1; x += 4)
      w.lineTo(x, base + Math.sin(x * 0.035 + t * 0.004) * amp + Math.sin(x * 0.011 - t * 0.0023) * amp)
    w.lineTo(x1, H)
    w.closePath()
    const grad = w.createLinearGradient(0, base, 0, nameBox.bottom + 10)
    grad.addColorStop(0, '#FFFFFF')
    grad.addColorStop(1, '#E9F0F9')
    w.fillStyle = grad
    w.fill()
    w.setTransform(1, 0, 0, 1, 0, 0)
    w.globalCompositeOperation = 'destination-in'
    w.drawImage(glyph!, 0, 0)
    return water!
  }

  // Each tile is one ASCII block cell that flips like a card when the wave front reaches it.
  function drawTiles(c: CanvasRenderingContext2D, wave: number, t: number) {
    const cx = W / 2, cy = H / 2
    const maxD = Math.hypot(W, H) / 2 / tile
    const front = phase === 'wave' ? easeIO(wave) * (maxD + 6) - 2 : phase === 'done' ? 1e9 : -1e9
    const tt = t * 0.001
    const rcx = cx + Math.cos(tt * 0.3) * W * 0.12
    const rcy = cy + Math.sin(tt * 0.41) * H * 0.1
    const dim = phase === 'wave' ? 0.85 : 0.6
    const flipping = phase === 'wave' || phase === 'done'
    const img = atlas!
    c.fillStyle = BG
    // Before the wave no tile has flipped, so the tile backs are one rectangle.
    if (!flipping) c.fillRect(0, 0, cols * tile, rows * tile)
    for (let j = 0, q = 0; j < rows; j++)
      for (let i = 0; i < cols; i++, q++) {
        const x = i * tile + tile / 2, y = j * tile + tile / 2
        const h1 = tileH1[q], h2 = tileH2[q]
        let squash = 1, turn = 0
        if (flipping) {
          // flipState(), inlined: no object per tile.
          const k = clamp((front - tileDist[q] - h1 * 1.6) / 2.2, 0, 1)
          if (k >= 1) continue // flipped: transparent, the home page shows
          const flip = smoothstep(k) * Math.PI
          squash = Math.abs(Math.cos(flip))
          turn = Math.sin(flip)
          c.globalAlpha = 1
          c.fillRect(x - tile / 2, y - tile / 2, tile, tile)
        }
        const rip = Math.sin((Math.hypot(x - rcx, y - rcy) / tile) * 0.55 - tt * 1.2) * 0.5 + 0.5
        const hue = h2 * 0.35 + rip * 0.45 + tt * 0.04
        const twinkle = h2 > 0.985 ? 0.5 * (0.5 + 0.5 * Math.sin(tt * 6 + h1 * 40)) : 0
        const lum = clamp(bootLum(rip, h1, tileCalm[q], dim, turn) + twinkle, 0, 1)
        const s = levelOf(lum) * HUE_BUCKETS + hueBucket(hue)
        // A flipping tile keeps its horizontal squash through a narrower destination.
        const dw = squash >= 1 ? tile : tile * Math.max(squash, 0.04)
        c.globalAlpha = 0.45 + 0.55 * lum
        c.drawImage(img, atlasSX[s], atlasSY[s], cell, cell, x - dw / 2, y - tile / 2, dw, tile)
      }
    c.globalAlpha = 1
  }

  function drawName(c: CanvasRenderingContext2D, scale: number, alpha: number, lvl: number, t: number, subAlpha: number) {
    if (!fontsReady || alpha <= 0 || !plate) return
    c.save()
    c.globalAlpha = alpha
    c.translate(W / 2, H / 2)
    c.scale(scale, scale)
    c.translate(-W / 2, -H / 2)
    const r = nameRect
    c.drawImage(plate, r.x / dpr, r.y / dpr, r.w / dpr, r.h / dpr)
    c.drawImage(drawWater(lvl, t), r.x / dpr, r.y / dpr, r.w / dpr, r.h / dpr)
    // "aka" small, "nemo" larger, on one baseline, centred as a pair, close under the name.
    c.fillStyle = `rgba(195,199,210,${subAlpha})`
    const akaF = `italic 400 ${Math.max(11, fontSize * 0.19)}px ${SERIF_FONT}`
    const nemoF = `italic 400 ${Math.max(14, fontSize * 0.3)}px ${SERIF_FONT}`
    c.font = akaF
    const aw = c.measureText('aka ').width
    c.font = nemoF
    const nm = c.measureText('nemo')
    const x0 = W / 2 - (aw + nm.width) / 2
    const by = nameBox.bottom + nm.actualBoundingBoxAscent + fontSize * 0.08
    c.textAlign = 'left'
    c.textBaseline = 'alphabetic'
    c.font = akaF
    c.fillText('aka ', x0, by)
    c.font = nemoF
    c.fillText('nemo', x0 + aw, by)
    c.restore()
  }

  function drawPercent(c: CanvasRenderingContext2D, pct: number) {
    c.font = `500 ${Math.max(12, W / 70)}px ${UI_FONT}`
    c.textAlign = 'right'
    c.textBaseline = 'alphabetic'
    c.fillStyle = LABEL_COLOR
    c.fillText(`loading… ${pct} %`, W - 20, H - 20)
  }

  // Reduced motion: dark screen, a still name and the % number. Drawn on each progress change only.
  function drawStill() {
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, W, H)
    drawName(ctx, 1, 1, target, 0, 1)
    drawPercent(ctx, Math.floor(target * 100))
  }

  function frame(now: number) {
    if (!ctx || destroyed) return
    const dt = Math.min(100, lastNow ? now - lastNow : 16)
    lastNow = now
    let p = 0
    if (phase === 'fill') {
      // The water chases real progress: eased, but never faster than a 0.7 s full fill.
      const gap = target - level
      if (gap > 0) level += clamp(gap * (1 - Math.exp(-dt / 250)), Math.min(gap, dt / 1500), dt / 700)
      if (playing && level >= 0.999) {
        level = 1
        phase = 'hold'
        phaseStart = now
      }
    } else {
      const dur = phase === 'hold' ? BOOT_TIMING.holdMs : phase === 'press' ? BOOT_TIMING.pressMs : BOOT_TIMING.waveMs
      p = clamp((now - phaseStart) / dur, 0, 1)
      if (p >= 1) {
        phaseStart = now
        p = 0
        if (phase === 'hold') phase = 'press'
        else if (phase === 'press') phase = 'wave'
        else {
          finish()
          return
        }
      }
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    drawTiles(ctx, p, now)
    let scale = 1, alpha = 1
    if (phase === 'press') scale = 1 - 0.16 * easeIn(p)
    if (phase === 'wave') {
      scale = 0.84 - 0.1 * p
      alpha = 1 - easeIO(clamp(p / 0.35, 0, 1))
    }
    if (fontsReady && !nameStart) nameStart = now
    const subAlpha = phase === 'fill' ? clamp((now - nameStart) / 900, 0, 1) : 1
    drawName(ctx, scale, alpha, level, now, subAlpha)
    if (phase === 'fill' || phase === 'hold') drawPercent(ctx, phase === 'fill' ? Math.floor(level * 100) : 100)
    raf = requestAnimationFrame(frame)
  }

  function finish() {
    phase = 'done'
    cancelAnimationFrame(raf)
    const cb = onDone
    onDone = undefined
    cb?.()
  }

  const onResize = () => {
    layout()
    if (still) drawStill()
  }

  layout()
  if (ctx) {
    // Paint the dark screen at once so the page never flashes under it.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, W, H)
    window.addEventListener('resize', onResize)
    const fonts = document.fonts
    Promise.resolve(fonts?.load('400 40px "Talina"')).catch(() => []).then(() => {
      if (destroyed) return
      fontsReady = true
      layout()
      if (still) drawStill()
    })
    if (still) drawStill()
    else raf = requestAnimationFrame(frame)
  }

  return {
    setProgress(f) {
      target = clamp(Math.max(target, f), 0, 1)
      if (still) drawStill()
    },
    play(cb) {
      onDone = cb
      target = 1
      if (!ctx) return finish()
      if (still) {
        drawStill()
        const anim = canvas.animate?.([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease', fill: 'forwards' })
        fadeTimer = setTimeout(finish, anim ? 200 : 0)
        return
      }
      playing = true
    },
    skip() {
      clearTimeout(fadeTimer)
      finish()
    },
    destroy() {
      destroyed = true
      cancelAnimationFrame(raf)
      clearTimeout(fadeTimer)
      window.removeEventListener('resize', onResize)
      onDone = undefined
    },
  }
}
