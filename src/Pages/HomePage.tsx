import { Layout } from '../Components/Layout'
import Experience from '../Sections/Experience'
import Hero from '../Sections/Hero'
import HomeProjects from '../Sections/HomeProjects'
import { Water } from '../Sections/Water'

// Tasks 12-14 fill the placeholders. Sections from Experience down are deep (dark glass, pale text).
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
      <section id="certificates" data-depth="deep" className="min-h-[40vh]" />
      <section id="contact" data-depth="deep" className="min-h-[40vh]" />
    </Layout>
  )
}
