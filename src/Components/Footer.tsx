import { site } from '../content/site'

// Home's footer sits on the abyss, so it takes the pale copy colour.
export default function Footer({ surface = 'sub' }: { surface?: 'home' | 'sub' }) {
  const tone = surface === 'home' ? 'text-[#B9C3E8]' : 'text-[var(--text-secondary)]'
  return (
    <footer className={`mx-auto flex w-full max-w-[1200px] flex-col gap-1 px-4 py-8 text-[14px] ${tone} sm:flex-row sm:justify-between`}>
      <p className="m-0">{`© ${new Date().getFullYear()} ${site.name}`}</p>
      <p className="m-0">Nemo is still building.</p>
    </footer>
  )
}
