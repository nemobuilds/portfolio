import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, test, expect } from 'vitest'
import { ThemeProvider } from '../theme/ThemeProvider'
import ProjectsPage from './ProjectsPage'
import ProjectCard from '../Components/ProjectCard'
import { FilterButtons } from '../Components/FilterButtons'
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

  test('filter shows only that category and updates the URL', async () => {
    page()
    expect(cards()).toHaveLength(5)
    await userEvent.click(screen.getByRole('radio', { name: /Full-Stack Applications/ }))
    expect(cards()).toHaveLength(2)
    expect(screen.getByTestId('where')).toHaveTextContent('/projects?category=Full-Stack%20Applications')
    expect(screen.getByRole('radio', { name: /Full-Stack Applications/ })).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(screen.getByRole('radio', { name: /All/ }))
    expect(cards()).toHaveLength(5)
    expect(screen.getByTestId('where')).toHaveTextContent(/^\/projects$/)
  })

  test('the category in the URL is applied on load', () => {
    page('/projects?category=AI%20%26%20Automation')
    expect(cards()).toHaveLength(1)
    expect(within(cards()[0]).getByRole('heading', { name: 'Lore of Legends' })).toBeInTheDocument()
  })

  test('an unknown category in the URL shows all projects', () => {
    page('/projects?category=Nope')
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

  test('empty categories have no filter button', () => {
    page()
    const radios = within(screen.getByRole('radiogroup', { name: 'Filter projects' })).getAllByRole('radio')
    expect(radios.map((r) => r.textContent)).toEqual([
      'All5',
      'Full-Stack Applications2',
      'Frontend & UI/UX1',
      'Backend & APIs1',
      'AI & Automation1',
    ])
  })

  test('an empty category in the URL shows all projects', () => {
    page('/projects?category=Mobile%20Apps')
    expect(cards()).toHaveLength(5)
  })
})

describe('FilterButtons', () => {
  const options = [
    { label: 'All', count: 3 },
    { label: 'A', count: 1 },
    { label: 'B', count: 2 },
  ]

  test('arrow keys move the selection and wrap', async () => {
    const picked: string[] = []
    render(<FilterButtons options={options} selected="All" onSelect={(l) => picked.push(l)} />)
    screen.getByRole('radio', { name: /All/ }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(picked).toEqual(['A'])
    await userEvent.keyboard('{ArrowLeft}')
    expect(picked).toEqual(['A', 'All'])
    screen.getByRole('radio', { name: /^All/ }).focus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(picked.at(-1)).toBe('B')
  })

  test('only the selected radio is in the tab order', () => {
    render(<FilterButtons options={options} selected="A" onSelect={() => {}} />)
    expect(screen.getByRole('radio', { name: /^A1$/ })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('radio', { name: /^B2$/ })).toHaveAttribute('tabindex', '-1')
  })
})

describe('FilterButtons theme', () => {
  test('selected filter uses the inverse text token, defined for dark', () => {
    document.documentElement.dataset.theme = 'dark'
    render(<FilterButtons options={[{ label: 'All', count: 1 }]} selected="All" onSelect={() => {}} />)
    const cls = screen.getByRole('radio').className
    expect(cls).toContain('text-[var(--text-inverse)]')
    expect(cls).not.toContain('--bg')
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

  test('public project does not say the code is private', () => {
    show(base)
    expect(screen.queryByText('Code is private')).toBeNull()
  })
})
