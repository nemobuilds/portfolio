import { mix } from './color'
import { seeded } from './rng'
import {
  boxHitsAny,
  CELL,
  clownfishAlpha,
  easeVeil,
  fishBox,
  fishCount,
  fishHalfHeight,
  fishLength,
  makeFish,
  needsRespawn,
  respawn,
  separate,
  stepFish,
  VEIL_MIN,
  type Box,
  type Fish,
} from './fish'
import { sideClassify, type Cell } from './sideFish'
import { initialAngler, stepAngler, type AnglerState } from './angler'
import { buildSeabed, SEABED_ROWS } from './seabed'
import { cloudCells, fitCell, makeClouds, shapeCols, shapeRows, SHIMMER_S, skyFade, stepClouds, type Cloud } from './clouds'
import { waterColor } from '../Sections/Water'

export type AquariumMode = 'home' | 'angler-only'
export type Zone = { top: number; bottom: number }

export type AquariumOptions = {
  mode: AquariumMode
  reducedMotion: boolean
  /** Viewport rects of text on the water. Fish passing behind them fade into heavy haze. */
  calmRects(): DOMRect[]
  /** Viewport bands where the grid shows; each edge fades over 180px. */
  gridZones(): Zone[]
  /** Viewport y of the sea floor line. Defaults to the viewport bottom. */
  floorY?(): number
  /**
   * The hero sky, in viewport px: the room for the cloud band (between the navbar and
   * the hero's first line of text) and the surface line. Clouds never leave that room.
   * Above the surface there are no fish or bubbles; they fade in over FADE px below it.
   */
  sky?(): { cloudTop: number; cloudBottom: number; surface: number } | null
  /**
   * Viewport rects of controls, headings and cards. A whole fish, bubble or cloud that
   * overlaps one (or calm text) fades to VEIL_MIN; sprites are never clipped.
   */
  clearRects?(): DOMRect[]
  /**
   * Viewport bands of the page sections the fish live in (for example Projects,
   * Experience, Certifications). Fish and bubbles are anchored to these bands, so they
   * scroll away with the page; only bands near the viewport are moved and drawn.
   * Without it, the viewport itself is the one band (the old fixed-screen behaviour).
   */
  regions?(): Zone[]
}

export type AquariumEngine = { setDepth(d: number): void; start(): void; stop(): void; destroy(): void }

const CS = CELL
const FADE = 180
const FADE_STRIPS = 12
const fontFor = (cell: number) => `500 ${Math.round(cell * 0.9)}px "Geist Mono Variable", "Geist Mono", ui-monospace, monospace`
const FONT = fontFor(CS)
const CLOUD_ALPHA = 0.9
const FISH_DEPTHS = [0.05, 0.85, 0.2, 0.65]
const BUBBLES = 26
const ANGLER_FOG = 0.1

const COL = {
  body: '#FF8237', bodyG: '#E3480B', rim: '#F25815', rimG: '#A8340C',
  band: '#F6EFE2', bandG: '#B9AE98', edge: '#2A1A12', edgeG: '#6B4A36',
  fin: '#FFA158', finDark: '#D2440B', tail: '#FFA158', tailG: '#D2440B',
  spine: '#F05712', spineG: '#2A1A12', soft: '#FFA965', softG: '#D2440B',
}
type Tile = [fill: string, glyphFill: string, glyph: string]
const FISH_TILE: Record<string, Tile> = {
  body: [COL.body, COL.bodyG, '+'],
  eye: [COL.body, COL.bodyG, '+'],
  rim: [COL.rim, COL.rimG, '#'],
  band: [COL.band, COL.bandG, ':'],
  edge: [COL.edge, COL.edgeG, '%'],
  tailEdge: [COL.edge, COL.edgeG, '%'],
  tail: [COL.tail, COL.tailG, '='],
  spine: [COL.spine, COL.spineG, '^'],
  soft: [COL.soft, COL.softG, '|'],
}

// Side-view anglerfish facing right. * lure, e eye, b belly, = tail root.
const ANGLER = [
  '                  *',
  '                 /',
  '            ----/',
  '         #######',
  ' \\    ###########+',
  '  \\ ####+####+###e#',
  '  =####+##+#####vvv',
  '  =###+####+##',
  ' / ###+bbb+####^^^^',
  '/   ~~#bbbbb##+##',
  '      ~~#######',
]
const ANG_W = Math.max(...ANGLER.map((r) => r.length))
const ANG_TILE: Record<string, Tile> = {
  '#': ['#2B2540', '#4A3F66', '#'],
  '+': ['#3A3156', '#5E5280', '+'],
  b: ['#5B4E70', '#7D6E92', ':'],
  '=': ['#2B2540', '#5E5280', '='],
}
const ANG_GLYPH: Record<string, string> = { v: '#EDE6D2', '^': '#EDE6D2', '-': '#8A7FA8', '/': '#8A7FA8', '\\': '#8A7FA8', '~': '#6B5F8A' }
const LURE_HALO = [0, 0.22, 0.1, 0.045]

/** x and y are local to the bubble's region (see AquariumOptions.regions). */
type Bubble = { x: number; y: number; s: number; veil?: number; region: number }
/** Fish and bubbles per region when the page provides regions. */
const FISH_PER_REGION_WIDE = 2
const FISH_PER_REGION_PHONE = 1
const BUBBLES_PER_REGION = 9
/** alpha: the whole sprite's opacity (its veil), applied to every one of its cells alike. */
type Put = { fill?: Tile; glyph?: string; ink?: string; eye?: boolean; bubble?: boolean; fog: number; fish: boolean; alpha: number }

export function createAquarium(canvas: HTMLCanvasElement, opts: AquariumOptions): AquariumEngine {
  const ctx = canvas.getContext('2d')
  const home = opts.mode === 'home'
  const still = opts.reducedMotion
  const rng = seeded(7)
  const seabedCanvas = document.createElement('canvas')
  const gridLight = document.createElement('canvas')
  const gridDeep = document.createElement('canvas')

  let W = 0
  let H = 0
  let dpr = 1
  let depth = home ? 0 : 1
  let water = waterColor(depth)
  let fish: Fish[] = []
  let bubbles: Bubble[] = []
  let clouds: Cloud[] = []
  let angler: AnglerState = initialAngler()
  let anglerCol = 0
  let anglerFace = 1
  let frame = 0
  let running = false
  let last = 0
  let destroyed = false
  const fogCache = new Map<string, string>()

  /** Blend toward the water colour; amounts are rounded to 1/20 so the cache stays small. */
  function F(color: string, amount: number): string {
    if (amount <= 0) return color
    const q = Math.round(amount * 20)
    const key = color + q
    let v = fogCache.get(key)
    if (!v) {
      v = mix(color, water, q / 20)
      fogCache.set(key, v)
    }
    return v
  }

  function sizeCanvas(c: HTMLCanvasElement, h: number) {
    c.width = Math.round(W * dpr)
    c.height = Math.round(h * dpr)
  }

  function paintGrid(c: HTMLCanvasElement, fine: string, bold: string) {
    sizeCanvas(c, H)
    const g = c.getContext('2d')
    if (!g) return
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.lineWidth = 1
    const cols = Math.ceil(W / CS)
    const rows = Math.ceil(H / CS)
    for (const [step, col] of [[1, fine], [8, bold]] as const) {
      g.strokeStyle = col
      g.beginPath()
      for (let i = 0; i <= cols; i += step) {
        g.moveTo(i * CS + 0.5, 0)
        g.lineTo(i * CS + 0.5, H)
      }
      for (let j = 0; j <= rows; j += step) {
        g.moveTo(0, j * CS + 0.5)
        g.lineTo(W, j * CS + 0.5)
      }
      g.stroke()
    }
  }

  /** Sand, rocks, shells and kelp from the same cells; drawn once per size. */
  function paintSeabed() {
    sizeCanvas(seabedCanvas, SEABED_ROWS * CS)
    const g = seabedCanvas.getContext('2d')
    if (!g) return
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.clearRect(0, 0, W, SEABED_ROWS * CS)
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = FONT
    const cols = Math.ceil(W / CS)
    const grid = buildSeabed(cols, 11)
    const isSand = (ch: string | undefined) => ch === ':' || ch === '.' || ch === ','
    const tile = (c: number, r: number, fill: string) => {
      g.fillStyle = fill
      g.fillRect(c * CS + 1, r * CS + 1, CS - 1, CS - 1)
    }
    const glyph = (c: number, r: number, ch: string, fill: string, alpha = 1) => {
      g.globalAlpha = alpha
      g.fillStyle = fill
      g.fillText(ch, c * CS + CS / 2, r * CS + CS / 2 + 1)
      g.globalAlpha = 1
    }
    for (let c = 0; c < cols; c++) {
      let top = SEABED_ROWS
      while (top > 0 && isSand(grid[top - 1][c])) top--
      // solid backing so nothing shows through the gaps between sand tiles
      g.fillStyle = '#070A1E'
      g.fillRect(c * CS, top * CS, CS, (SEABED_ROWS - top) * CS)
      for (let r = 0; r < SEABED_ROWS; r++) {
        const ch = grid[r][c]
        if (ch === ' ') continue
        if (isSand(ch)) {
          const crest = r === top
          tile(c, r, crest ? '#262E66' : r === top + 1 ? '#1B2150' : '#141940')
          glyph(c, r, ch, crest ? '#8E9BE0' : '#4B5699')
        } else if (ch === '#') {
          tile(c, r, '#2A2F5C')
          glyph(c, r, '#', '#5F6CB5')
        } else if (ch === '(' || ch === ')') {
          // kelp fades toward its tip
          const up = Math.max(0, Math.min(1, (SEABED_ROWS - 5 - r) / 12))
          glyph(c, r, ch, '#5FB3A0', 0.9 * (1 - 0.45 * up))
        } else {
          glyph(c, r, ch, '#D9D2C0', 0.8)
        }
      }
    }
  }

  /** The bands the fish live in, in viewport px. Without page regions, the viewport. */
  function regionList(): Zone[] {
    return opts.regions ? opts.regions() : [{ top: 0, bottom: H }]
  }
  const regionHeight = (z: Zone) => Math.max(CS, z.bottom - z.top)
  /** Only bands within half a screen of the viewport are moved and drawn. */
  const nearView = (z: Zone | undefined): z is Zone => !!z && z.bottom > -H * 0.5 && z.top < H * 1.5
  let regionCount = 0
  /** A bubble rises and wraps around inside its own region. */
  const bubbleY = (b: Bubble, z: Zone) => {
    const h = regionHeight(z)
    return ((b.y % h) + h) % h
  }

  function populate() {
    fish = []
    bubbles = []
    const zones = regionList()
    regionCount = zones.length
    if (!opts.regions) {
      // one band, the viewport: the old behaviour (also used by tests and the 404 tank)
      const n = fishCount(W, H)
      fish = FISH_DEPTHS.slice(0, n).map((d) => ({ ...makeFish(rng, { width: W, height: H }, d), region: 0 }))
      bubbles = Array.from({ length: BUBBLES }, () => ({ x: rng() * W, y: rng() * H, s: 0.4 + rng(), region: 0 }))
      return
    }
    const per = W < 760 ? FISH_PER_REGION_PHONE : FISH_PER_REGION_WIDE
    zones.forEach((z, region) => {
      const bounds = { width: W, height: regionHeight(z) }
      for (let k = 0; k < per; k++) {
        const d = FISH_DEPTHS[fish.length % FISH_DEPTHS.length]
        fish.push({ ...makeFish(rng, bounds, d), region })
      }
      for (let k = 0; k < BUBBLES_PER_REGION; k++)
        bubbles.push({ x: rng() * W, y: rng() * bounds.height, s: 0.4 + rng(), region })
    })
  }

  function resize() {
    const widthChanged = window.innerWidth !== W
    dpr = Math.min(2, window.devicePixelRatio || 1)
    W = window.innerWidth
    H = window.innerHeight
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    if (home) {
      // the hero sky grid is only a faint hint (about a quarter of its original strength),
      // so the clouds read and the sky stays calm
      paintGrid(gridLight, 'rgba(30,50,130,0.033)', 'rgba(30,50,130,0.055)')
      paintGrid(gridDeep, 'rgba(160,180,255,0.10)', 'rgba(160,180,255,0.18)')
      // a phone's URL bar changes only the height: keep the fish and clouds where they are
      if (widthChanged || fish.length === 0) populate()
      if (widthChanged || clouds.length === 0) clouds = opts.sky ? makeClouds(W) : []
    }
    paintSeabed()
  }

  const floorRow = () => Math.round((opts.floorY ? opts.floorY() : H) / CS)

  /** Grid from y0 to y1 (viewport px); the outer 180px of each edge fades in strips. */
  function drawZone(src: HTMLCanvasElement, y0: number, y1: number) {
    if (!ctx || !src.width) return
    const a = Math.max(-FADE, y0 - FADE)
    const b = Math.min(H + FADE, y1 + FADE)
    if (b <= 0 || a >= H) return
    const band = (top: number, bottom: number, alpha: number) => {
      const t = Math.max(0, top)
      const btm = Math.min(H, bottom)
      if (btm <= t || alpha <= 0) return
      ctx.globalAlpha = alpha
      ctx.drawImage(src, 0, t * dpr, W * dpr, (btm - t) * dpr, 0, t, W, btm - t)
    }
    const strip = FADE / FADE_STRIPS
    for (let k = 0; k < FADE_STRIPS; k++) {
      const alpha = (k + 0.5) / FADE_STRIPS
      band(a + k * strip, a + (k + 1) * strip, alpha)
      band(b - (k + 1) * strip, b - k * strip, alpha)
    }
    band(a + FADE, b - FADE, 1)
    ctx.globalAlpha = 1
  }

  function drawAngler(t: number, floor: number) {
    if (!ctx || still) return
    const s = angler
    let alpha = 0
    let rise = 0
    if (s.phase === 'rising') rise = alpha = Math.min(1, s.timer / 1.8)
    else if (s.phase === 'holding') rise = alpha = 1
    else if (s.phase === 'sinking') {
      const k = Math.min(1, s.timer / 1.6)
      alpha = 1 - k
      rise = 1 - k * 0.4
    }
    if (alpha <= 0.01) return
    const bob = s.phase === 'holding' ? Math.round(Math.sin(t * 0.9) * 0.6) : 0
    const top = floor - 5 - Math.round(rise * 8) + bob
    ctx.globalAlpha = alpha * 0.85
    let lure: [number, number] | null = null
    for (let r = 0; r < ANGLER.length; r++) {
      if (top + r >= floor) break
      const row = ANGLER[r].padEnd(ANG_W)
      for (let c = 0; c < ANG_W; c++) {
        let ch = anglerFace === 1 ? row[c] : row[ANG_W - 1 - c]
        if (anglerFace === -1) ch = ch === '/' ? '\\' : ch === '\\' ? '/' : ch
        if (ch === ' ') continue
        const x = (anglerCol + c) * CS
        const y = (top + r) * CS
        if (y > H) continue
        const tile = ANG_TILE[ch]
        if (tile) {
          ctx.fillStyle = F(tile[0], ANGLER_FOG)
          ctx.fillRect(x + 1, y + 1, CS - 1, CS - 1)
          ctx.fillStyle = F(tile[1], ANGLER_FOG)
          ctx.fillText(tile[2], x + CS / 2, y + CS / 2 + 1)
        } else if (ch === 'e') {
          ctx.fillStyle = F('#D9D2C0', ANGLER_FOG)
          ctx.fillRect(x + 1, y + 1, CS - 1, CS - 1)
          ctx.fillStyle = '#0B0B0B'
          ctx.fillRect(x + 4, y + 4, CS - 7, CS - 7)
        } else if (ch === '*') {
          lure = [x, y]
        } else {
          ctx.fillStyle = F(ANG_GLYPH[ch] ?? '#8A7FA8', ANGLER_FOG)
          ctx.fillText(ch, x + CS / 2, y + CS / 2 + 1)
        }
      }
    }
    if (lure) {
      // the only warm light: one bright cell, its neighbours lit a little less, cell by cell
      const p = 0.65 + 0.35 * Math.sin(t * 2.2)
      const [lx, ly] = lure
      for (let dy = -3; dy <= 3; dy++)
        for (let dx = -3; dx <= 3; dx++) {
          const d = Math.abs(dx) + Math.abs(dy)
          if (!d || d > 3) continue
          ctx.fillStyle = `rgba(255,236,160,${(LURE_HALO[d] * p).toFixed(3)})`
          ctx.fillRect(lx + dx * CS + 1, ly + dy * CS + 1, CS - 1, CS - 1)
        }
      ctx.fillStyle = `rgba(255,244,190,${(0.7 + 0.3 * p).toFixed(3)})`
      ctx.fillRect(lx + 1, ly + 1, CS - 1, CS - 1)
    }
    ctx.globalAlpha = 1
  }

  /** The cloud band in the hero sky: fish-style tiles in sky colours, faint over the text. */
  function drawClouds(t: number) {
    const sky = opts.sky?.()
    if (!ctx || !sky || clouds.length === 0) return
    // the tiles shrink to fit between the navbar and the text, or the band is skipped
    const cell = fitCell(W, sky.cloudBottom - sky.cloudTop)
    if (!cell || sky.cloudBottom < 0 || sky.cloudTop > H) return
    const step = still ? 0 : Math.floor(t / SHIMMER_S)
    ctx.font = fontFor(cell)
    for (const c of clouds) {
      // the whole cloud fades together; no tile is dimmed on its own
      ctx.globalAlpha = CLOUD_ALPHA * (c.veil ?? 1)
      for (const k of cloudCells(c, step)) {
        const x = Math.round(c.x + k.col * cell)
        const y = Math.round(sky.cloudTop + (c.row + k.row) * cell)
        if (x + cell <= 0 || x >= W) continue
        ctx.fillStyle = k.tile.fill
        ctx.fillRect(x + 1, y + 1, cell - 1, cell - 1)
        ctx.fillStyle = k.tile.ink
        ctx.fillText(k.glyph, x + cell / 2, y + cell / 2 + 1)
      }
    }
    ctx.globalAlpha = 1
    ctx.font = FONT
  }

  function drawSeabed(floor: number) {
    if (!ctx || !seabedCanvas.width) return
    if (floor <= 0 || floor - SEABED_ROWS >= Math.ceil(H / CS)) return
    ctx.drawImage(seabedCanvas, 0, (floor - SEABED_ROWS) * CS, W, SEABED_ROWS * CS)
  }

  /**
   * The cells of one region's fish and bubbles. Fish and bubbles live in page regions:
   * their cells are laid out from `base` (the region's top rounded down to a whole cell)
   * and the caller shifts the pass by the leftover `off` px. So they move smoothly with
   * the page and keep the exact same shape at any scroll position.
   */
  function collectCells(t: number, region: number, z: Zone, base: number, off: number): Map<number, Put> {
    const cols = Math.ceil(W / CS)
    const rows = Math.ceil(H / CS) + 1
    const grid = new Map<number, Put>()
    // the hero is sky: nothing from the water shows above the surface; it fades in below it
    const sky = opts.sky?.() ?? null
    const above = (py: number) => (sky ? skyFade(py + off, sky.surface, FADE) : 0)
    for (const b of bubbles) {
      if (b.region !== region) continue
      const i = Math.floor(b.x / CS)
      const j = Math.floor((base + bubbleY(b, z)) / CS)
      if (j < 0 || j >= rows) continue
      const k = above((j + 0.5) * CS)
      if (k >= 1) continue
      if (i >= 0 && i < cols) grid.set(j * cols + i, { glyph: 'o', bubble: true, fog: k, fish: false, alpha: b.veil ?? 1 })
    }
    if (clownfishAlpha(depth) === 0) return grid
    const order = fish.filter((f) => (f.region ?? 0) === region).sort((a, b) => b.depth - a.depth)
    for (const f of order) {
      const fog = 0.08 + f.depth * 0.62
      const L = fishLength(f)
      const half = fishHalfHeight(f)
      const fx = f.x - L
      const fy = base + f.y
      // every cell of this fish gets the same opacity: the shape always stays complete
      const alpha = f.veil ?? 1
      const put = (i: number, j: number, cell: Omit<Put, 'fog' | 'fish' | 'alpha'>, _px: number, py: number) => {
        if (i < 0 || j < 0 || i >= cols || j >= rows) return
        const k = above(py)
        if (k >= 1) return
        grid.set(j * cols + i, { ...cell, fish: true, fog: Math.max(fog, k), alpha })
      }
      const i0 = Math.max(0, Math.floor(fx / CS) - 1)
      const i1 = Math.min(cols - 1, Math.ceil(f.x / CS) + 1)
      const j0 = Math.max(0, Math.floor((fy - half * 1.8) / CS))
      const j1 = Math.min(rows - 1, Math.ceil((fy + half * 1.8) / CS))
      for (let j = j0; j <= j1; j++)
        for (let i = i0; i <= i1; i++) {
          const px = (i + 0.5) * CS
          const py = (j + 0.5) * CS
          const u = (px - fx) / L
          const v = (py - fy) / half
          const c: Cell = sideClassify(u, v, t, f.phase)
          if (!c) continue
          const key = c === 'fin' ? (v < 0 ? (u < 0.53 ? 'spine' : 'soft') : 'soft') : c
          put(i, j, { fill: FISH_TILE[key] }, px, py)
        }
      // pectoral fin: a beating glyph behind the head band
      const beat = Math.sin(t * 9 + f.phase) > 0
      const pi = Math.floor((fx + L * 0.72) / CS)
      const pj = Math.floor((fy + half * 0.28) / CS)
      const finInk = depth < 0.4 ? COL.finDark : COL.fin
      put(pi, pj, { glyph: beat ? '~' : '-', ink: finInk }, pi * CS, pj * CS)
      put(pi + 1, pj + (beat ? 1 : 0), { glyph: beat ? '~' : '-', ink: finInk }, pi * CS, pj * CS)
      // one eye: cream tile, black pupil, glint
      const ex = fx + L * 0.895
      const ey = fy - half * 0.3
      put(Math.floor(ex / CS), Math.floor(ey / CS), { eye: true }, ex, ey)
    }
    return grid
  }

  function draw(t: number) {
    if (!ctx || destroyed) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = FONT
    // depth in 1/100 steps: the fog cache survives most frames while scrolling
    const next = waterColor(home ? Math.round(depth * 100) / 100 : 1)
    if (next !== water) {
      water = next
      fogCache.clear()
    }
    const floor = floorRow()

    drawAngler(t, floor) // deepest thing in the tank
    drawSeabed(floor) // the sand covers the angler's lower half
    if (!home) return
    // reduced motion has no animation loop: snap the fades straight to their targets
    if (still) updateVeils(Infinity)

    const cols = Math.ceil(W / CS)
    const reef = clownfishAlpha(depth)
    const glyphInk = mix('#1D2A55', '#C8D2F5', Math.min(1, depth * 2.2))
    regionList().forEach((z, region) => {
      if (!nearView(z)) return // only regions near the viewport are drawn
      const base = Math.floor(z.top / CS) * CS
      const off = z.top - base
      ctx.setTransform(dpr, 0, 0, dpr, 0, off * dpr)
      for (const [key, c] of collectCells(t, region, z, base, off)) {
        const x = (key % cols) * CS
        const y = Math.floor(key / cols) * CS
        ctx.globalAlpha = (c.fish ? reef : 0.55) * c.alpha
        if (c.eye) {
          const p = Math.round(CS * 0.5)
          const o = Math.round((CS - 1 - p) / 2)
          ctx.fillStyle = F('#F6EFE2', c.fog)
          ctx.fillRect(x + 1, y + 1, CS - 1, CS - 1)
          ctx.fillStyle = F('#0B0B0B', c.fog)
          ctx.fillRect(x + 1 + o, y + 1 + o, p, p)
          ctx.fillStyle = F('#FFFFFF', c.fog)
          ctx.fillRect(x + 1 + o, y + 1 + o, 2, 2)
        } else if (c.fill) {
          ctx.fillStyle = F(c.fill[0], c.fog)
          ctx.fillRect(x + 1, y + 1, CS - 1, CS - 1)
          ctx.fillStyle = F(c.fill[1], c.fog)
          ctx.fillText(c.fill[2], x + CS / 2, y + CS / 2 + 1)
        } else if (c.glyph) {
          ctx.fillStyle = F(c.ink ?? glyphInk, c.fog)
          ctx.fillText(c.glyph, x + CS / 2, y + CS / 2 + 1)
        }
      }
    })
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalAlpha = 1
    drawClouds(t)

    // the grid sits on top: fish and clouds sit under it
    const src = depth < 0.5 ? gridLight : gridDeep
    for (const z of opts.gridZones()) drawZone(src, z.top, z.bottom)
  }

  /**
   * Whole-sprite fades. A fish, bubble or cloud whose box overlaps text, a control, a
   * heading or a card eases down to VEIL_MIN over VEIL_S, and back up when it leaves.
   * Sprites are never clipped. dt = Infinity snaps straight to the target (reduced motion).
   */
  function updateVeils(dt: number) {
    const blockers: Box[] = [...opts.calmRects(), ...(opts.clearRects?.() ?? [])].filter(
      (r) => r.bottom > 0 && r.top < H && r.right > r.left,
    )
    const target = (box: Box) => (boxHitsAny(box, blockers) ? VEIL_MIN : 1)
    const zones = regionList()
    for (const f of fish) {
      const z = zones[f.region ?? 0]
      if (!nearView(z)) continue
      f.veil = easeVeil(f.veil ?? 1, target(fishBox({ ...f, y: z.top + f.y })), dt)
    }
    for (const b of bubbles) {
      const z = zones[b.region]
      if (!nearView(z)) continue
      const y = z.top + bubbleY(b, z)
      b.veil = easeVeil(b.veil ?? 1, target({ left: b.x - CS / 2, top: y - CS / 2, right: b.x + CS / 2, bottom: y + CS / 2 }), dt)
    }
    const sky = opts.sky?.()
    const cell = sky ? fitCell(W, sky.cloudBottom - sky.cloudTop) : 0
    for (const c of clouds) {
      if (!sky || !cell) continue
      const top = sky.cloudTop + c.row * cell
      const box = { left: c.x, top, right: c.x + shapeCols(c.shape) * cell, bottom: top + shapeRows(c.shape) * cell }
      c.veil = easeVeil(c.veil ?? 1, target(box), dt)
    }
  }

  function update(dt: number, t: number) {
    if (home) {
      const zones = regionList()
      // sections appear later or change count (layout): give each its own fish again
      if (zones.length !== regionCount) populate()
      updateVeils(dt)
      zones.forEach((z, region) => {
        if (!nearView(z)) return // far-away regions stay frozen until they come near
        const group = fish.filter((f) => (f.region ?? 0) === region)
        const bounds = { width: W, height: regionHeight(z) }
        separate(group, dt)
        for (const f of group) {
          stepFish(f, dt, t)
          if (needsRespawn(f, bounds)) respawn(f, group, bounds, rng)
        }
      })
      for (const b of bubbles) {
        if (!nearView(zones[b.region])) continue
        b.y -= dt * 14 * b.s
        b.x += Math.sin(t + b.y * 0.02) * 0.15
      }
      stepClouds(clouds, dt, W)
    } else {
      updateVeils(dt)
    }
    const isDeep = home ? floorRow() < Math.ceil(H / CS) - 1 : true
    const prev = angler.phase
    angler = stepAngler(angler, dt, isDeep, rng)
    if (prev === 'hidden' && angler.phase === 'rising') {
      // rises from a bottom corner, facing into the page
      const cols = Math.ceil(W / CS)
      anglerFace = angler.side === 'left' ? 1 : -1
      anglerCol =
        anglerFace === 1
          ? Math.round(cols * (0.03 + rng() * 0.15))
          : Math.round(cols * (0.82 + rng() * 0.15)) - ANG_W
    }
  }

  function tick(now: number) {
    frame = 0
    if (!running) return
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    update(dt, now / 1000)
    draw(now / 1000)
    frame = requestAnimationFrame(tick)
  }

  function stop() {
    running = false
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }

  function onScroll() {
    // fish, bubbles and clouds are anchored to the page (regions and the hero), so a
    // scroll moves them with the content; only the still frame needs a redraw
    if (still) draw(0)
  }

  function onResize() {
    resize()
    if (still) draw(0)
  }

  function onFonts() {
    paintSeabed()
    if (still) draw(0)
  }

  resize()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  document.fonts?.ready.then(() => {
    if (!destroyed) onFonts()
  })

  return {
    setDepth(d) {
      depth = home ? Math.max(0, Math.min(1, d)) : 1
      if (still) draw(0)
    },
    start() {
      if (destroyed) return
      if (still) {
        draw(0)
        return
      }
      if (running) return
      running = true
      last = performance.now()
      frame = requestAnimationFrame(tick)
    },
    stop,
    destroy() {
      stop()
      destroyed = true
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    },
  }
}
