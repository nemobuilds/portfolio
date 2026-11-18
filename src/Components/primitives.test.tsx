import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect, vi } from 'vitest'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { EmptyState } from './EmptyState'
import { SmartImage } from './SmartImage'
import { StackChip } from './StackChip'
import { StackList } from './StackList'

describe('primitives', () => {
  test('Avatar shows JR after an image error', () => {
    const { container } = render(<Avatar size={32} />)
    fireEvent.error(container.querySelector('img')!)
    const jr = screen.getByText('JR')
    expect(jr).toHaveAttribute('aria-hidden', 'true')
    expect(jr).toHaveStyle({ fontSize: `${32 * 0.42}px` })
  })

  test('Avatar img has empty alt and given size', () => {
    const { container } = render(<Avatar size={32} />)
    const img = container.querySelector('img')!
    expect(img).toHaveAttribute('width', '32')
    expect(img).toHaveAttribute('height', '32')
    expect(img).toHaveAttribute('alt', '')
    expect(img).toHaveAttribute('src', '/images/avatar.jpg')
  })

  test('StackList folds extras', () => {
    render(<StackList items={['A', 'B', 'C', 'D', 'E', 'F']} limit={4} />)
    const more = screen.getByText('+2 more')
    expect(more).toHaveAttribute('title', 'E, F')
    expect(more).toHaveAttribute('aria-label', expect.stringContaining('E, F'))
    expect(screen.queryByText('E')).toBeNull()
  })

  test('StackChip falls back to chain and code icons', () => {
    const { container: a } = render(<StackChip name="LangChain" />)
    expect(a.querySelector('[data-icon="chain"]')).not.toBeNull()
    const { container: b } = render(<StackChip name="Kafka" />)
    expect(b.querySelector('[data-icon="code"]')).not.toBeNull()
    const { container: c } = render(<StackChip name="React" />)
    expect(c.querySelector('[data-icon="logo"]')).not.toBeNull()
  })

  test('external Button opens a new tab', () => {
    render(<Button variant="secondary" href="https://example.com" external label="Live site" />)
    const a = screen.getByRole('link', { name: 'Live site' })
    expect(a).toHaveAttribute('target', '_blank')
    expect(a).toHaveAttribute('rel', 'noreferrer')
  })

  test('Button renders a router Link for to, and a button otherwise', async () => {
    const onClick = vi.fn()
    render(
      <MemoryRouter>
        <Button variant="primary" to="/projects" label="Projects" />
        <Button variant="icon" leadingIcon="menu" label="Open menu" onClick={onClick} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects')
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  test('SmartImage with no src shows the initial', () => {
    render(<SmartImage alt="" initial="Z" aspect="16/9" />)
    expect(screen.getByText('Z')).toBeInTheDocument()
  })

  test('SmartImage falls back after an error', () => {
    const { container } = render(<SmartImage src="/x.png" alt="x" initial="Z" aspect="16/9" />)
    expect(container.querySelector('img')).toHaveAttribute('loading', 'lazy')
    fireEvent.error(container.querySelector('img')!)
    expect(screen.getByText('Image unavailable')).toBeInTheDocument()
  })

  test('EmptyState runs its action', async () => {
    const onClick = vi.fn()
    render(<EmptyState message="Nothing here" action={{ label: 'Reset', onClick }} />)
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(onClick).toHaveBeenCalled()
  })
})
