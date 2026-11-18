import { homeProjects } from '../content/projects'
import { site } from '../content/site'

export type BootPhase = 'fill' | 'hold' | 'press' | 'wave' | 'done'

export const BOOT_TIMING = { capMs: 4000, holdMs: 300, pressMs: 450, waveMs: 1700 }

const SEEN_KEY = 'boot-seen'

/**
 * Reports settled / total as each task settles (a rejection counts as settled).
 * Resolves when all tasks settle or when capMs passes, then reports 1.
 */
export function trackProgress(
  tasks: Promise<unknown>[],
  onProgress: (fraction: number) => void,
  capMs: number,
): Promise<void> {
  const total = tasks.length
  let settled = 0
  let last = 0
  let finished = false
  const report = (f: number) => {
    if (finished || f <= last) return
    last = f
    onProgress(f)
  }
  const all = Promise.all(
    tasks.map(t =>
      Promise.resolve(t).then(
        () => report(++settled / total),
        () => report(++settled / total),
      ),
    ),
  )
  let timer: ReturnType<typeof setTimeout> | undefined
  const cap = new Promise<void>(resolve => {
    timer = setTimeout(resolve, capMs)
  })
  return Promise.race([all, cap]).then(() => {
    clearTimeout(timer)
    report(1)
    finished = true
  })
}

function loadFont(spec: string): Promise<unknown> {
  const fonts = typeof document !== 'undefined' ? document.fonts : undefined
  return fonts?.load ? fonts.load(spec) : Promise.resolve()
}

function decodeImage(src: string): Promise<unknown> {
  const img = new Image()
  img.src = src
  if (typeof img.decode === 'function') return img.decode()
  return new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
  })
}

function pageLoaded(): Promise<unknown> {
  if (document.readyState === 'complete') return Promise.resolve()
  return new Promise(resolve => window.addEventListener('load', resolve, { once: true }))
}

/** The real work the boot waits for: the three fonts, two images and the page load. */
export function bootTasks(): Promise<unknown>[] {
  const tasks: Promise<unknown>[] = [
    loadFont('400 1em "Talina"'),
    loadFont('500 1em "Inter Tight Variable"'),
    loadFont('italic 400 1em "Instrument Serif"'),
    decodeImage(site.avatarPath),
  ]
  const first = homeProjects[0]
  const poster = first?.cover?.poster ?? first?.thumbnail
  if (poster) tasks.push(decodeImage(poster))
  tasks.push(pageLoaded())
  return tasks
}

/** False once the boot has played in this tab's session. */
export function shouldBoot(storage: Pick<Storage, 'getItem'>): boolean {
  try {
    return storage.getItem(SEEN_KEY) !== '1'
  } catch {
    return true
  }
}

export function markBootSeen(): void {
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // storage blocked: the boot plays again next load, which is harmless
  }
}
