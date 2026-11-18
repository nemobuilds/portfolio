import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import type { Plugin } from 'vite'
import { validateProjects } from '../src/content/validate'
import type { Project } from '../src/content/types'

const ID = 'virtual:content/projects'
const RESOLVED_ID = '\0' + ID
export const PROJECTS_DIR = 'src/content/projects'

/**
 * Reads every `<root>/src/content/projects/*.md`, validates it (image files must
 * exist in `<root>/public/`) and renders the case-study Markdown to HTML.
 * Throws a ContentError that names the file and field.
 */
export function loadProjects(root: string, dir = join(root, PROJECTS_DIR)): Project[] {
  const files: Record<string, string> = {}
  for (const name of readdirSync(dir).filter(f => f.endsWith('.md')).sort()) {
    const path = join(dir, name)
    files[relative(root, path).replaceAll('\\', '/')] = readFileSync(path, 'utf8')
  }
  return validateProjects(files, p => existsSync(join(root, 'public', p)))
}

/** Serves `virtual:content/projects`: the projects as plain JSON, checked at build time. */
export function contentPlugin(options: { dir?: string } = {}): Plugin {
  let root = process.cwd()
  const dir = () => resolve(root, options.dir ?? PROJECTS_DIR)
  return {
    name: 'content-projects',
    configResolved(config) {
      root = config.root
    },
    resolveId(id) {
      return id === ID ? RESOLVED_ID : undefined
    },
    load(id) {
      if (id !== RESOLVED_ID) return
      try {
        const projects = loadProjects(root, dir())
        return `export default ${JSON.stringify(projects)}`
      } catch (e) {
        this.error(e instanceof Error ? e.message : String(e))
      }
    },
    configureServer(server) {
      // Any .md added, changed or removed under the projects folder reloads the content.
      server.watcher.add(dir())
      server.watcher.on('all', (_event, file) => {
        if (!file.endsWith('.md') || !resolve(file).startsWith(dir())) return
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}
