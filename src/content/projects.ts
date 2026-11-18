import data from 'virtual:content/projects'
import type { Project } from './types'

export type { Category, CaseStudy, Project } from './types'

// Parsed, validated and rendered at build time by plugins/contentPlugin.ts.
export const projects: Project[] = data

export const homeProjects: Project[] = projects
  .filter(p => p.home)
  .sort((a, b) => a.homeOrder! - b.homeOrder!)

export const getProject = (slug: string): Project | undefined => projects.find(p => p.slug === slug)

export function nextProject(slug: string): Project {
  const i = projects.findIndex(p => p.slug === slug)
  return projects[(i + 1) % projects.length]
}
