import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './theme/ThemeProvider'
import { BootScreen } from './boot/BootScreen'
import { shouldBoot } from './boot/bootProgress'
import { ScrollToTop } from './Components/ScrollToTop'
import HomePage from './Pages/HomePage'
import CertificatesPage from './Pages/CertificatesPage'
import CaseStudyPage from './Pages/CaseStudyPage'
import NotFoundPage from './Pages/NotFoundPage'
import ProjectsPage from './Pages/ProjectsPage'

function firstBoot(): boolean {
  try {
    return shouldBoot(window.sessionStorage)
  } catch {
    return true
  }
}

export default function App() {
  const [booting, setBooting] = useState(firstBoot)

  return (
    <ThemeProvider>
      <ScrollToTop />
      {booting && <BootScreen onDone={() => setBooting(false)} />}
      <div inert={booting}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<CaseStudyPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/certificates/:id" element={<CertificatesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </ThemeProvider>
  )
}
