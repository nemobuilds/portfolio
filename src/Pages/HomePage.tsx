import { Layout } from '../Components/Layout'
import { Aquarium } from '../aquarium/Aquarium'
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
      <Aquarium mode="home" />
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
      {/* the bottom padding is the sea floor: seabed and anglerfish sit between the socials and the footer */}
      <section id="contact" data-depth="deep" aria-labelledby="contact-heading" className="pb-[250px] min-[760px]:pb-[270px]">
        <Contact />
      </section>
      <DepthGauge stops={gaugeStops} />
    </Layout>
  )
}
