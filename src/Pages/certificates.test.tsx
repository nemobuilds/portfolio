import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import { describe, test, expect } from 'vitest'
import { ThemeProvider } from '../theme/ThemeProvider'
import CertificatesPage from './CertificatesPage'
import CertificateCard from '../Components/CertificateCard'
import { certificates } from '../content/certifications'

function Where() {
  const l = useLocation()
  return <output data-testid="where">{l.pathname}</output>
}

function page(path = '/certificates') {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/certificates/:id" element={<CertificatesPage />} />
        </Routes>
        <Where />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

const cardFor = (name: string) =>
  screen.getAllByRole('article').find((c) => within(c).queryByRole('heading', { name }))!

describe('CertificatesPage', () => {
  test('header, count line and title', () => {
    page()
    expect(screen.getByRole('heading', { level: 1, name: 'Certifications' })).toBeInTheDocument()
    expect(screen.getByText('Three certifications. Each one links to its issuer.')).toBeInTheDocument()
    expect(document.title).toBe('Certifications · John Rogee Turqueza')
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

  test('PCAP card has no date line and sorts last', () => {
    page()
    const cards = screen.getAllByRole('article')
    expect(within(cards.at(-1)!).getByRole('heading', { name: 'PCAP: Programming Essentials in Python' })).toBeInTheDocument()
    expect(within(cards.at(-1)!).queryByText(/\b(19|20)\d\d\b/)).toBeNull()
    expect(within(cards.at(-1)!).getByRole('link', { name: /View on LinkedIn/ })).toBeInTheDocument()
  })

  test('card without scan shows a fallback panel with the issuer', () => {
    page()
    expect(within(cardFor('Introduction to Software Engineering')).getByText('IBM')).toBeInTheDocument()
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
