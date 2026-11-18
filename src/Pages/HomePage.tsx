import { Layout } from '../Components/Layout'
import Contact from '../Sections/Contact'
import DepthGauge, { gaugeStops } from '../Components/DepthGauge'
import Experience from '../Sections/Experience'
import Hero from '../Sections/Hero'
import HomeCertifications from '../Sections/HomeCertifications'
import HomeProjects from '../Sections/HomeProjects'
import { Water } from '../Sections/Water'

// Sections from Experience down are deep (dark glass, pale text).
export default function HomePage() {
  return (
    <Layout surface="home">
      <Water />
      <Hero />
      <section id="projects" aria-labelledby="projects-heading">
        <HomeProjects />
      </section>
      <section id="experience" data-depth="deep" aria-label="Experience and tech stack">
        <Experience />
      </section>
      <section id="certificates" data-depth="deep" aria-labelledby="certifications-heading">
        <HomeCertifications />
      </section>
      <section id="contact" data-depth="deep" aria-labelledby="contact-heading">
        <Contact />
      </section>
      <DepthGauge stops={gaugeStops} />
    </Layout>
  )
}
