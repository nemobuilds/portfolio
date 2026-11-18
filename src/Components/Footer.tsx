import { site } from '../content/site'

export default function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-[1200px] flex-col gap-1 px-4 py-8 text-[14px] text-[var(--text-secondary)] sm:flex-row sm:justify-between">
      <p className="m-0">{`© ${new Date().getFullYear()} ${site.name}`}</p>
      <p className="m-0">Nemo is still building.</p>
    </footer>
  )
}
