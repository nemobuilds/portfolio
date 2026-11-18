import { Layout } from '../Components/Layout'

export function HomePage() {
  return (
    <Layout surface="home">
      <h1>John Rogee Turqueza</h1>
    </Layout>
  )
}

export function CertificatesPage() {
  return (
    <Layout surface="sub" current="certifications">
      <h1>Certifications</h1>
    </Layout>
  )
}
