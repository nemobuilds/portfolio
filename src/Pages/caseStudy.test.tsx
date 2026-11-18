import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, test, expect } from 'vitest'
import { ThemeProvider } from '../theme/ThemeProvider'
import CaseStudyPage, { CaseStudyView } from './CaseStudyPage'
import { ProjectLinks } from '../Components/ProjectLinks'
import { FactsRail } from '../Components/FactsRail'
import { Gallery } from '../Components/Gallery'
import { getProject, nextProject } from '../content/projects'
import type { Project } from '../content/projects'

const base = getProject('zealia')!

const full: Project = {
  ...base,
  slug: 'zealia',
  role: 'Solo build',
  period: '2025 to present',
  caseStudy: {
    problem: '<p>Problem text.</p>',
    approach: '<p>Approach text.</p>',
    built: '<ul><li>Part one</li></ul>',
    results: '<p>Results text.</p>',
    learned: '<p>Learned text.</p>',
  },
}

const at = (ui: React.ReactNode, path = '/projects/x') =>
  render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </ThemeProvider>,
  )

describe('ProjectLinks', () => {
  test('renders nothing with no links', () => {
    const { container } = render(<ProjectLinks />)
    expect(container).toBeEmptyDOMElement()
  })

  test('puts Live demo last, after extras, GitHub and the private note', () => {
    render(
      <ProjectLinks
        repoUrl="https://github.com/a/b"
        liveUrl="https://example.com"
        extras={[{ label: 'Docs', url: 'https://example.com/docs' }]}
      />,
    )
    const labels = screen.getAllByRole('link').map((l) => l.textContent)
    expect(labels).toEqual(['Docs', 'GitHub', 'Live demo'])
  })

  test('private shows plain text, not a link', () => {
    render(<ProjectLinks isPrivate liveUrl="https://example.com" />)
    expect(screen.getByText('Code is private').closest('a')).toBeNull()
    expect(screen.queryByRole('link', { name: 'GitHub' })).toBeNull()
  })
})

describe('FactsRail', () => {
  test('hides Role and Timeline when missing', () => {
    render(<FactsRail project={{ ...base, role: undefined, period: undefined }} />)
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.queryByText('Role')).toBeNull()
    expect(screen.queryByText('Timeline')).toBeNull()
  })

  test('shows Role and Timeline when present', () => {
    render(<FactsRail project={full} />)
    expect(screen.getByText('Solo build')).toBeInTheDocument()
    expect(screen.getByText('2025 to present')).toBeInTheDocument()
    expect(screen.getByText('Side project')).toBeInTheDocument()
  })
})

describe('Gallery', () => {
  const item = (n: number) => ({ src: `/g${n}.png`, caption: `Shot ${n}` })

  test('renders nothing for zero items', () => {
    const { container } = at(<Gallery items={[]} />)
    expect(container.querySelector('[data-columns]')).toBeNull()
  })

  test('columns for 1, 2 and 3 items', () => {
    const cols = (n: number) => {
      const { container, unmount } = at(<Gallery items={Array.from({ length: n }, (_, i) => item(i))} />)
      const v = container.querySelector('[data-columns]')!.getAttribute('data-columns')
      unmount()
      return v
    }
    expect(cols(1)).toBe('1')
    expect(cols(2)).toBe('2')
    expect(cols(3)).toBe('3')
    expect(cols(5)).toBe('3')
  })
})

describe('CaseStudyView', () => {
  test('short template shows the description', () => {
    at(<CaseStudyView project={base} />)
    expect(screen.getByRole('heading', { level: 2, name: 'What it is' })).toBeInTheDocument()
    expect(screen.getByText(base.description ?? base.summary)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Problem' })).toBeNull()
  })

  test('full template renders story headings and optional ones only when set', () => {
    at(<CaseStudyView project={full} />)
    for (const h of ['Problem', 'Approach', 'What I built', 'Results', 'Learned']) {
      expect(screen.getByRole('heading', { level: 2, name: h })).toBeInTheDocument()
    }
    expect(screen.getByText('Problem text.')).toBeInTheDocument()
    expect(screen.queryByText('What it is')).toBeNull()
  })

  test('omits Results and Learned when absent', () => {
    const p = { ...full, caseStudy: { problem: '<p>a</p>', approach: '<p>b</p>', built: '<p>c</p>' } }
    at(<CaseStudyView project={p} />)
    expect(screen.queryByRole('heading', { name: 'Results' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Learned' })).toBeNull()
  })

  test('title, document title, no cover section without cover', () => {
    at(<CaseStudyView project={{ ...full, cover: undefined }} />)
    expect(screen.getByRole('heading', { level: 1, name: full.name })).toBeInTheDocument()
    expect(document.title).toBe(`${full.name} · John Rogee Turqueza`)
    expect(screen.queryByLabelText('Cover')).toBeNull()
  })

  test('shows the cover image when set', () => {
    at(<CaseStudyView project={{ ...full, cover: { image: '/c.png' } }} />)
    expect(screen.getByLabelText('Cover')).toBeInTheDocument()
  })
})

describe('CaseStudyPage route', () => {
  const route = (path: string) =>
    at(
      <Routes>
        <Route path="/projects/:slug" element={<CaseStudyPage />} />
      </Routes>,
      path,
    )

  test('unknown slug renders Project not found', () => {
    route('/projects/nope')
    expect(screen.getByRole('heading', { name: 'Project not found' })).toBeInTheDocument()
  })

  test('known slug renders the project', () => {
    route('/projects/tachyon')
    expect(screen.getByRole('heading', { level: 1, name: getProject('tachyon')!.name })).toBeInTheDocument()
  })

  test('next project from AMBITION is Tachyon and is linked', () => {
    expect(nextProject('ambition').slug).toBe('tachyon')
    route('/projects/ambition')
    const link = screen.getByRole('link', { name: /Next project:/ })
    expect(link).toHaveAttribute('href', '/projects/tachyon')
    expect(link).toHaveTextContent(getProject('tachyon')!.name)
  })
})
