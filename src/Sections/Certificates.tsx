import { homeCertificates } from '../content/certifications'
import SectionHeader from '../Components/SectionHeader'
import CertificateCard from '../Components/CertificateCard'
import ExternalLink from '../Components/ExternalLink'

export default function Certificates() {
  return (
    <section id="certificates" aria-labelledby="certificates-heading" className="section-shell font-mono">
      <SectionHeader
        id="certificates-heading"
        command="top_certifications"
        action={
          <ExternalLink
            href="/certificates"
            className="text-xs font-semibold text-accent no-underline hover:underline"
          >
            view all →
          </ExternalLink>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 pt-3 border-t border-border">
        {homeCertificates.map((cert) => (
          <CertificateCard key={cert.id} certificate={cert} variant="home" />
        ))}
      </div>
    </section>
  )
}