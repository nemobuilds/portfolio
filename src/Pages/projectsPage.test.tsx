import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, test, expect } from 'vitest'
import { ThemeProvider } from '../theme/ThemeProvider'
import ProjectsPage from './ProjectsPage'
import ProjectCard from '../Components/ProjectCard'
import { countWord } from '../content/count'
import { projects } from '../content/projects'
import type { Project } from '../content/projects'

function Where() {
  const l = useLocation()
  return <output data-testid="where">{l.pathname + l.search}</output>
}

function page(path = '/projects') {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <ProjectsPage />
        <Where />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

const cards = () => screen.getAllByRole('article')
const names = () => cards().map((c) => within(c).getByRole('heading').textContent)
const sidebarBox = (name: RegExp) =>
  within(screen.getByRole('complementary', { name: 'Filter projects' })).getByRole('checkbox', { name })

describe('countWord', () => {
  test('words up to twelve, digits after', () => {
    expect(countWord(5)).toBe('Five')
    expect(countWord(1)).toBe('One')
    expect(countWord(12)).toBe('Twelve')
    expect(countWord(13)).toBe('13')
  })
})

describe('ProjectsPage', () => {
  test('header counts in words and the title is set', () => {
    page()
    expect(screen.getByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument()
    expect(screen.getByText('Five projects. Each one opens a case study.')).toBeInTheDocument()
    expect(document.title).toBe('Projects · John Rogee Turqueza')
  })

  test('search narrows the cards, keeps the query in the URL and shows a removable chip', async () => {
    page()
    expect(cards()).toHaveLength(5)
    expect(screen.getByText('5 projects')).toBeInTheDocument()
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search projects' }), 'spring')
    expect(names()).toEqual(['Endpoint', 'AWS S3 Clone'])
    expect(screen.getByTestId('where')).toHaveTextContent('/projects?q=spring')
    expect(screen.getByText('Showing 2 of 5 projects')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remove search spring' }))
    expect(cards()).toHaveLength(5)
    expect(screen.getByTestId('where')).toHaveTextContent(/^\/projects$/)
  })

  test('a category checkbox filters, updates the URL, and Clear all resets', async () => {
    page()
    await userEvent.click(sidebarBox(/^Backend & APIs/))
    expect(names()).toEqual(['Endpoint', 'AWS S3 Clone'])
    expect(sidebarBox(/^Backend & APIs/)).toBeChecked()
    expect(screen.getByTestId('where')).toHaveTextContent('/projects?focus=backend-apis')
    expect(screen.getByRole('button', { name: 'Remove filter Backend & APIs' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(cards()).toHaveLength(5)
    expect(screen.getByTestId('where')).toHaveTextContent(/^\/projects$/)
  })

  test('picks in one group are OR, across groups AND, and no match shows the empty state', async () => {
    page()
    await userEvent.click(sidebarBox(/^Academic/))
    await userEvent.click(sidebarBox(/^Experiments & Prototypes/))
    expect(cards()).toHaveLength(4)
    await userEvent.click(sidebarBox(/^Games & Interactive/))
    expect(names()).toEqual(['Lore of Legends'])
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search projects' }), 'kotlin')
    expect(screen.queryAllByRole('article')).toHaveLength(0)
    expect(screen.getByText('No projects match these filters.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Clear search and filters' }))
    expect(cards()).toHaveLength(5)
  })

  test('filters in the URL are applied on load, old ?category= links too', () => {
    page('/projects?focus=ai-automation')
    expect(names()).toEqual(['Lore of Legends'])
    cleanup()
    page('/projects?category=AI%20%26%20Automation')
    expect(names()).toEqual(['Lore of Legends'])
  })

  test('an unknown category in the URL shows all projects', () => {
    page('/projects?focus=nope&category=Nope')
    expect(cards()).toHaveLength(5)
  })

  test('AMBITION card has Live demo and no GitHub', () => {
    page()
    const card = cards().find((c) => within(c).queryByRole('heading', { name: 'AMBITION' }))!
    const live = within(card).getByRole('link', { name: /Live demo/ })
    expect(live).toHaveAttribute('href', 'https://ambition-beta.vercel.app/')
    expect(live).toHaveAttribute('target', '_blank')
    expect(live.className).toContain('text-[var(--text)]')
    expect(live).toHaveAttribute('rel', 'noreferrer')
    expect(within(card).queryByRole('link', { name: /GitHub/ })).toBeNull()
  })

  test('card says Details when there is no case study', () => {
    page()
    for (const c of cards()) {
      expect(within(c).queryByText('Case study')).toBeNull()
      expect(within(c).getByText('Details')).toBeInTheDocument()
    }
  })

  test('the sidebar has three groups and no checkbox for empty categories', () => {
    page()
    const aside = screen.getByRole('complementary', { name: 'Filter projects' })
    expect(within(aside).getAllByRole('group').map((g) => g.querySelector('legend')?.textContent)).toEqual([
      'Focus',
      'Origin',
      'Domain',
    ])
    for (const empty of ['Mobile Apps', 'Client Work', 'SaaS & Products', 'Data & Analytics', 'E-Commerce & FinTech']) {
      expect(within(aside).queryByRole('checkbox', { name: new RegExp(empty) })).toBeNull()
    }
    expect(within(aside).getAllByRole('checkbox')).toHaveLength(12)
  })

  test('each count is the result size if that box were added', async () => {
    page()
    await userEvent.click(sidebarBox(/^Academic/))
    const label = (name: RegExp) => sidebarBox(name).closest('label')!.textContent
    expect(label(/^Education & Teams/)).toBe('Education & Teams2')
    expect(label(/^Games & Interactive/)).toBe('Games & Interactive0')
    expect(label(/^Personal Projects/)).toBe('Personal Projects3')
  })

  test('on phones a Filters button opens a sheet; Show closes it and focus returns', async () => {
    page()
    const open = screen.getByRole('button', { name: /^Filters/ })
    await userEvent.click(open)
    const sheet = screen.getByRole('dialog', { name: 'Filters' })
    expect(within(sheet).getByRole('button', { name: 'Close filters' })).toHaveFocus()
    await userEvent.click(within(sheet).getByRole('checkbox', { name: /^Backend & APIs/ }))
    expect(within(sheet).getByRole('checkbox', { name: /^Backend & APIs/ })).toHaveFocus()
    await userEvent.click(within(sheet).getByRole('button', { name: 'Show 2 projects' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(names()).toEqual(['Endpoint', 'AWS S3 Clone'])
    expect(screen.getByRole('button', { name: /^Filters/ })).toHaveFocus()
    expect(screen.getByRole('button', { name: /^Filters/ })).toHaveTextContent('Filters1')
  })

  test('Esc and the scrim close the sheet', async () => {
    page()
    await userEvent.click(screen.getByRole('button', { name: /^Filters/ }))
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /^Filters/ }))
    await userEvent.click(screen.getByTestId('filter-scrim'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('ProjectCard', () => {
  const base: Project = { ...projects[0], caseStudy: undefined, repoUrl: undefined, liveUrl: undefined, isPrivate: false }
  const show = (p: Project) =>
    render(
      <MemoryRouter>
        <ProjectCard project={p} />
      </MemoryRouter>,
    )

  test('whole card opens the project through a stretched title link', () => {
    show(base)
    const link = screen.getByRole('link', { name: base.name })
    expect(link).toHaveAttribute('href', `/projects/${base.slug}`)
    expect(link.className).toMatch(/after:absolute/)
  })

  test('says Case study when a case study exists', () => {
    show({ ...base, caseStudy: { problem: '<p>p</p>', approach: '<p>a</p>', built: '<p>b</p>' } })
    expect(screen.getByRole('link', { name: /Case study/ })).toHaveAttribute('href', `/projects/${base.slug}`)
    expect(screen.queryByText('Details')).toBeNull()
  })

  test('GitHub link shows only with repoUrl and opens a new tab', () => {
    show({ ...base, repoUrl: 'https://github.com/x/y' })
    const gh = screen.getByRole('link', { name: /GitHub/ })
    expect(gh).toHaveAttribute('href', 'https://github.com/x/y')
    expect(gh).toHaveAttribute('target', '_blank')
  })

  test('private project shows lock and "Code is private"', () => {
    show({ ...base, isPrivate: true })
    expect(screen.getByText('Code is private')).toBeInTheDocument()
  })

  test('shows only the Focus categories, in group order', () => {
    show({ ...base, categories: ['Open Source', 'Backend & APIs', 'Full-Stack Applications', 'Developer Tools'] })
    expect(screen.getByText('Full-Stack Applications · Backend & APIs')).toBeInTheDocument()
    expect(screen.queryByText(/Open Source/)).toBeNull()
  })

  test('public project does not say the code is private', () => {
    show(base)
    expect(screen.queryByText('Code is private')).toBeNull()
  })
})
