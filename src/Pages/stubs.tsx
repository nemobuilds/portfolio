import { useParams } from 'react-router-dom'
import { Layout } from '../Components/Layout'

export function HomePage() {
  return (
    <Layout surface="home">
      <h1>John Rogee Turqueza</h1>
    </Layout>
  )
}

export function CaseStudyPage() {
  const { slug } = useParams()
  return (
    <Layout surface="sub" current="projects" backLink>
      <h1>{slug ?? 'Project'}</h1>
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
