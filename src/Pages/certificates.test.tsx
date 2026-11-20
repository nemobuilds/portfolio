import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import { describe, test, expect } from 'vitest'
import { ThemeProvider } from '../theme/ThemeProvider'
import CertificatesPage from './CertificatesPage'
import CertificateCard from '../Components/CertificateCard'
import { certificates } from '../content/certifications'
import { countWord } from '../content/count'

function Where() {
  const l = useLocation()
  return <output data-testid="where">{l.pathname + l.search}</output>
}

function Back() {
  const navigate = useNavigate()
  return <button onClick={() => navigate(-1)}>test-back</button>
}

function page(path = '/certificates', entries?: string[]) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={entries ?? [path]} initialIndex={entries ? entries.length - 1 : 0}>
        <Back />
        <Routes>
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/certificates/:id" element={<CertificatesPage />} />
        </Routes>
        <Where />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

const box = (name: RegExp) =>
  within(screen.getByRole('complementary', { name: 'Filter certifications' })).getByRole('checkbox', { name })

const cardFor = (name: string) =>
  screen.getAllByRole('article').find((c) => within(c).queryByRole('heading', { name }))!

describe('CertificatesPage', () => {
  test('header, count line and title', () => {
    page()
    expect(screen.getByRole('heading', { level: 1, name: 'Certifications' })).toBeInTheDocument()
    expect(screen.getByText(`${countWord(certificates.length)} certifications. Each one links to its issuer.`)).toBeInTheDocument()
    expect(document.title).toBe('Certifications · John Rogee Turqueza')
  })

  test('the sidebar has Topic and Type groups in order, each box with a count', () => {
    page()
    const aside = screen.getByRole('complementary', { name: 'Filter certifications' })
    const groups = within(aside).getAllByRole('group')
    expect(groups.map((g) => g.querySelector('legend')?.textContent)).toEqual(['Topic', 'Type'])
    expect(within(groups[1]).getAllByRole('checkbox').map((c) => c.closest('label')!.textContent)).toEqual([
      'Certification2',
      'Course10',
      'Event2',
    ])
  })

  test('topic and type filters combine and update the URL', async () => {
    page()
    await userEvent.click(box(/^Cloud/))
    await userEvent.click(box(/^Data/))
    expect(screen.getAllByRole('article')).toHaveLength(5)
    await userEvent.click(box(/^Certification/))
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(cardFor('AZ-900')).toBeInTheDocument()
    expect(screen.getByTestId('where')).toHaveTextContent('/certificates?topic=cloud,data&type=certification')
    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(screen.getAllByRole('article')).toHaveLength(certificates.length)
  })

  test('search matches the name, short name and issuer', async () => {
    page()
    const search = screen.getByRole('searchbox', { name: 'Search certifications' })
    await userEvent.type(search, 'certiport')
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(cardFor('CCST Cybersecurity')).toBeInTheDocument()
    await userEvent.clear(search)
    await userEvent.type(search, 'az-900')
    expect(cardFor('AZ-900')).toBeInTheDocument()
    expect(screen.getByTestId('where')).toHaveTextContent('/certificates?q=az-900')
  })

  test('filters in the URL apply on load; unknown ones are ignored', () => {
    page('/certificates?type=event')
    expect(screen.getAllByRole('article')).toHaveLength(2)
    cleanup()
    page('/certificates?topic=nope&category=Nope')
    expect(screen.getAllByRole('article')).toHaveLength(certificates.length)
  })

  test('CCST card shows short name, full name, issuer via, date and verify button', () => {
    page()
    const card = cardFor('CCST Cybersecurity')
    expect(within(card).getByText('Cisco Certified Support Technician Cybersecurity')).toBeInTheDocument()
    expect(within(card).getByText('Cisco, via Certiport')).toBeInTheDocument()
    expect(within(card).getByText('April 2025').className).toContain('--date')
    const verify = within(card).getByRole('link', { name: /Verify on Credly/ })
    expect(verify).toHaveAttribute('target', '_blank')
    expect(verify).toHaveAttribute('rel', 'noreferrer')
  })

  test('the oldest card sorts last, and PCAP links to LinkedIn', () => {
    page()
    const cards = screen.getAllByRole('article')
    expect(within(cards.at(-1)!).getByRole('heading', { name: 'Integrated Programming Technologies 1' })).toBeInTheDocument()
    expect(within(cards.at(-1)!).getByText('December 2022')).toBeInTheDocument()
    expect(within(cardFor('PCAP: Programming Essentials in Python')).getByRole('link', { name: /View on LinkedIn/ })).toBeInTheDocument()
  })

  test('card without scan shows a fallback panel with the issuer', () => {
    page()
    const card = cardFor('AI Skills Fest 2026')
    expect(within(card).queryByRole('img', { name: /^Scan of/ })).toBeNull()
    expect(within(card).getAllByText('Microsoft').length).toBeGreaterThan(1)
  })

  test('/certificates/ccst-cybersecurity opens the dialog directly', () => {
    page('/certificates/ccst-cybersecurity')
    const dialog = screen.getByRole('dialog', { name: 'CCST Cybersecurity' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(within(dialog).getByText('Verified by issuer')).toBeInTheDocument()
    expect(within(dialog).getByText('April 2025')).toBeInTheDocument()
    expect(document.title).toBe('CCST Cybersecurity · Certifications · John Rogee Turqueza')
    expect(dialog.contains(document.activeElement)).toBe(true)
    expect(document.activeElement).toHaveAttribute('id', 'certificate-dialog-title')
  })

  test('Esc closes the dialog and returns focus to the card', async () => {
    page()
    const link = within(cardFor('CCST Cybersecurity')).getByRole('link', { name: 'CCST Cybersecurity' })
    await userEvent.click(link)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('where')).toHaveTextContent('/certificates/ccst-cybersecurity')
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByTestId('where')).toHaveTextContent(/^\/certificates$/)
    expect(link).toHaveFocus()
  })

  test('card, Next, then close leaves the list, and Back does not reopen a dialog', async () => {
    page('/certificates', ['/start', '/certificates'])
    await userEvent.click(within(cardFor('CCST Cybersecurity')).getByRole('link', { name: 'CCST Cybersecurity' }))
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('link', { name: /Next/ }))
    expect(screen.getByTestId('where')).toHaveTextContent('/certificates/innolympics-2025')
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByTestId('where')).toHaveTextContent(/^\/certificates$/)
    await userEvent.click(screen.getByRole('button', { name: 'test-back' }))
    expect(screen.getByTestId('where')).toHaveTextContent(/^\/start$/)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  test('Back while the dialog is open closes it', async () => {
    page('/certificates')
    await userEvent.click(within(cardFor('CCST Cybersecurity')).getByRole('link', { name: 'CCST Cybersecurity' }))
    await userEvent.click(screen.getByRole('button', { name: 'test-back' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByTestId('where')).toHaveTextContent(/^\/certificates$/)
  })

  test('deep link /certificates/pcap closes to /certificates with focus on the h1', async () => {
    page('/certificates/pcap')
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByTestId('where')).toHaveTextContent(/^\/certificates$/)
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
  })

  test('scrim click closes the dialog', async () => {
    page('/certificates/ccst-cybersecurity')
    await userEvent.click(screen.getByTestId('dialog-scrim'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  test('deep link close focuses the h1', async () => {
    page('/certificates/ccst-cybersecurity')
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
  })

  test('Close button closes the dialog', async () => {
    page('/certificates/ccst-cybersecurity')
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  test('Tab stays inside the dialog', async () => {
    page('/certificates/intro-software-engineering')
    const dialog = screen.getByRole('dialog')
    for (let i = 0; i < 12; i++) {
      await userEvent.tab()
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
    for (let i = 0; i < 12; i++) {
      await userEvent.tab({ shift: true })
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
  })

  test('first item has no Previous', () => {
    page(`/certificates/${certificates[0].id}`)
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).queryByText('Previous')).toBeNull()
    expect(within(dialog).getByText('Next')).toBeInTheDocument()
  })

  test('last item has no Next, and Previous names the earlier one', () => {
    page(`/certificates/${certificates.at(-1)!.id}`)
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).queryByText('Next')).toBeNull()
    expect(within(dialog).getByRole('link', { name: /Previous/ })).toHaveAttribute(
      'href',
      `/certificates/${certificates.at(-2)!.id}`,
    )
  })

  test('card shows the type as a badge and the topics as plain pills', () => {
    page()
    const card = cardFor('Intermediate Python')
    expect(within(card).getByText('Course')).toBeInTheDocument()
    expect(within(card).getByText('Type:')).toHaveClass('sr-only')
    const topics = within(card).getByRole('list', { name: 'Topics' })
    expect(within(topics).getAllByRole('listitem').map((p) => p.textContent)).toEqual(['Programming', 'Data'])
    expect(within(topics).queryByRole('link')).toBeNull()
  })

  test('the modal has Topic and Type rows with link pills', () => {
    page('/certificates/containerization-virtualization')
    const dialog = screen.getByRole('dialog')
    const links = (group: string) =>
      within(within(dialog).getByRole('list', { name: group })).getAllByRole('link').map((l) => [l.textContent, l.getAttribute('href')])
    expect(links('Topic')).toEqual([
      ['Cloud', '/certificates?topic=cloud'],
      ['DevOps & Containers', '/certificates?topic=devops-containers'],
    ])
    expect(links('Type')).toEqual([['Course', '/certificates?type=course']])
  })

  test('a modal pill closes the modal, filters the list and focuses the h1', async () => {
    page('/certificates')
    await userEvent.click(within(cardFor('AZ-900')).getByRole('link', { name: 'AZ-900' }))
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'Certification' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByTestId('where')).toHaveTextContent('/certificates?type=certification')
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(within(cardFor('AZ-900')).getByRole('link', { name: 'AZ-900' })).toHaveFocus()
  })

  test('unknown id renders Page not found', () => {
    page('/certificates/nope')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })
})

describe('CertificateCard', () => {
  const base = certificates[0]
  const show = (variant: 'page' | 'home') =>
    render(
      <MemoryRouter>
        <CertificateCard certificate={base} variant={variant} />
      </MemoryRouter>,
    )

  test('home variant uses the full name, no verify button, still links to the dialog', () => {
    show('home')
    expect(screen.getByRole('heading', { name: base.name })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Verify/ })).toBeNull()
    expect(screen.getByRole('link', { name: base.name })).toHaveAttribute('href', `/certificates/${base.id}`)
  })
})
