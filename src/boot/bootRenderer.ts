import { ditherPaths } from '../tiles/dither'
import { clamp, flipState, smoothstep } from '../tiles/flip'
import { BOOT_PALETTE, paletteAt } from '../tiles/palette'
import { bootLum, hash2, levelOf } from '../tiles/shimmer'
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

// The palette walk, sampled once so each tile is a table lookup.
const LUT_SIZE = 256
let lut: string[] | undefined
function paletteLUT(): string[] {
  if (!lut) {
    lut = []
    for (let i = 0; i < LUT_SIZE; i++) {
      const [r, g, b] = paletteAt(BOOT_PALETTE, i / LUT_SIZE)
      lut.push(`${r | 0},${g | 0},${b | 0}`)
    }
  }
  return lut
}

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
  let dither: Path2D[] = []
  let nameBox = { w: 0, top: 0, bottom: 0 }
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
    dither = ditherPaths(tile)

    // The name: min(12% H, 7.5% W), never wider than 42% of the screen.
    fontSize = Math.min(H * 0.12, W * 0.075)
    ctx.font = nameFont()
    ctx.textBaseline = 'middle'
    let mm = ctx.measureText(NAME)
    if (mm.width > W * 0.42) {
      fontSize *= (W * 0.42) / mm.width
      ctx.font = nameFont()
      mm = ctx.measureText(NAME)
    }
    const ny = H / 2 - fontSize * 0.08
    nameBox = { w: mm.width, top: ny - mm.actualBoundingBoxAscent, bottom: ny + mm.actualBoundingBoxDescent }

    // Offscreen letter mask, the slate plate cut from it, and a buffer for the water.
    glyph = offscreen(canvas.width, canvas.height)
    const g = glyph.getContext('2d')!
    g.scale(dpr, dpr)
    g.font = nameFont()
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillStyle = '#fff'
    g.fillText(NAME, W / 2, ny)
    plate = offscreen(canvas.width, canvas.height)
    const pc = plate.getContext('2d')!
    pc.drawImage(glyph, 0, 0)
    pc.globalCompositeOperation = 'source-in'
    pc.fillStyle = PLATE
    pc.fillRect(0, 0, plate.width, plate.height)
    water = offscreen(canvas.width, canvas.height)
  }

  // White water inside the letters, under a gently moving surface.
  function drawWater(lvl: number, t: number) {
    const w = water!.getContext('2d')!
    w.setTransform(1, 0, 0, 1, 0, 0)
    w.globalCompositeOperation = 'source-over'
    w.clearRect(0, 0, water!.width, water!.height)
    w.setTransform(dpr, 0, 0, dpr, 0, 0)
    const span = nameBox.bottom - nameBox.top + fontSize * 0.2
    const base = nameBox.bottom + fontSize * 0.1 - lvl * (span + 6)
    const amp = still ? 0 : lvl < 1 ? fontSize * 0.035 : fontSize * 0.012
    w.beginPath()
    w.moveTo(0, H)
    for (let x = 0; x <= W + 4; x += 4)
      w.lineTo(x, base + Math.sin(x * 0.035 + t * 0.004) * amp + Math.sin(x * 0.011 - t * 0.0023) * amp)
    w.lineTo(W + 4, H)
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
    const pal = paletteLUT()
    const calmW = nameBox.w * 0.62 || 1
    const calmH = fontSize * 1.5 || 1
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const x = i * tile + tile / 2, y = j * tile + tile / 2
        const h1 = hash2(i, j), h2 = hash2(j + 7, i + 3)
        const dist = Math.hypot(x - cx, y - cy) / tile
        const { k, squash, turn } = flipState(dist, front, h1 * 1.6, 2.2)
        if (k >= 1) continue // flipped: transparent, the home page shows
        const rip = Math.sin((Math.hypot(x - rcx, y - rcy) / tile) * 0.55 - tt * 1.2) * 0.5 + 0.5
        const hue = h2 * 0.35 + rip * 0.45 + tt * 0.04
        const rgb = pal[Math.floor((((hue % 1) + 1) % 1) * LUT_SIZE) % LUT_SIZE]
        // Calm zone: tiles near the name stay dim so the name reads.
        const calm = 0.25 + 0.75 * smoothstep(clamp(Math.hypot((x - cx) / calmW, (y - cy) / calmH) - 0.55, 0, 1))
        const twinkle = h2 > 0.985 ? 0.5 * (0.5 + 0.5 * Math.sin(tt * 6 + h1 * 40)) : 0
        const lum = clamp(bootLum(rip, h1, calm, dim, turn) + twinkle, 0, 1)
        c.fillStyle = BG
        c.fillRect(x - tile / 2, y - tile / 2, tile, tile)
        c.save()
        c.translate(x, y)
        c.scale(Math.max(squash, 0.04), 1)
        c.fillStyle = `rgba(${rgb},${0.45 + 0.55 * lum})`
        c.fill(dither[levelOf(lum)])
        c.restore()
      }
  }

  function drawName(c: CanvasRenderingContext2D, scale: number, alpha: number, lvl: number, t: number, subAlpha: number) {
    if (!fontsReady || alpha <= 0 || !plate) return
    c.save()
    c.globalAlpha = alpha
    c.translate(W / 2, H / 2)
    c.scale(scale, scale)
    c.translate(-W / 2, -H / 2)
    c.drawImage(plate, 0, 0, W, H)
    c.drawImage(drawWater(lvl, t), 0, 0, W, H)
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
    Promise.all(
      fonts?.load
        ? [`400 1em ${NAME_FONT}`, `italic 400 1em ${SERIF_FONT}`, `500 1em ${UI_FONT}`].map(f => fonts.load(f).catch(() => []))
        : [],
    ).then(() => {
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
