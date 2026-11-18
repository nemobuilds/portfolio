export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      onClick={(e) => {
        const h1 = document.querySelector<HTMLElement>('main h1')
        if (!h1) return
        e.preventDefault()
        h1.setAttribute('tabindex', '-1')
        h1.focus()
        h1.scrollIntoView?.({ block: 'start' })
      }}
    >
      Skip to content
    </a>
  )
}
