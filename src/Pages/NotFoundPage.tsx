import { useEffect } from 'react'
import { Layout } from '../Components/Layout'
import { Button } from '../Components/Button'
import { Aquarium } from '../aquarium/Aquarium'

const copy = {
  page: {
    title: 'Page not found',
    line: 'Nothing lives at this address. The link is old, or the address has a typo.',
    action: { label: 'See the projects', to: '/projects' },
  },
  project: {
    title: 'Project not found',
    line: 'This project was renamed or removed.',
    action: { label: 'All projects', to: '/projects' },
  },
}

export default function NotFoundPage({ variant = 'page' }: { variant?: 'page' | 'project' }) {
  const { title, line, action } = copy[variant]

  useEffect(() => {
    document.title = `${title} · John Rogee Turqueza`
  }, [title])

  return (
    <Layout surface="sub" forceTheme="dark">
      <Aquarium mode="angler-only" />
      <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-6 px-6 pt-16 min-[760px]:pt-[72px]">
        <h1 className="m-0 text-[48px] font-bold leading-[0.95] tracking-[-0.04em] text-[#F4EEE3] min-[760px]:text-[104px]">
          {title}
        </h1>
        <p className="m-0 max-w-[44ch] text-[18px] leading-normal text-[#B9C3E8] min-[760px]:text-[21px]">{line}</p>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3 pt-2">
          <Button variant="primary" to="/" label="Back to the surface" />
          <Button variant="secondary" surface="glass" to={action.to} label={action.label} trailingIcon="arrow" />
        </div>
      </div>
    </Layout>
  )
}
