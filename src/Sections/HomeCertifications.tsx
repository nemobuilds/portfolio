import CertificateCard from '../Components/CertificateCard'
import { Button } from '../Components/Button'
import { homeCertificates } from '../content/certifications'

export default function HomeCertifications() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 pt-12 pb-24 min-[760px]:px-8 min-[760px]:pt-16 min-[760px]:pb-32">
      <div className="flex items-end justify-between gap-6">
        <h2 id="certifications-heading" className="m-0 text-[32px] font-bold leading-none text-[var(--cream)] min-[760px]:text-[44px]" style={{ letterSpacing: '-0.035em' }}>
          Certifications
        </h2>
        <Button variant="secondary" surface="glass" to="/certificates" trailingIcon="arrow" label="All certifications" />
      </div>
      <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 min-[1100px]:grid-cols-3">
        {homeCertificates.map((c) => (
          <li key={c.id} className="min-w-0">
            <CertificateCard certificate={c} variant="home" />
          </li>
        ))}
      </ul>
    </div>
  )
}
