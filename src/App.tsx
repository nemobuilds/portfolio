import { lazy, Suspense, useLayoutEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './theme/ThemeProvider'
import { BootContext } from './boot/BootContext'
import { BootScreen } from './boot/BootScreen'
import { shouldBoot } from './boot/bootProgress'
import { ScrollToTop } from './Components/ScrollToTop'
import HomePage from './Pages/HomePage'

// Subpages are their own chunks: the first load only pays for the home page.
const ProjectsPage = lazy(() => import('./Pages/ProjectsPage'))
const CaseStudyPage = lazy(() => import('./Pages/CaseStudyPage'))
const CertificatesPage = lazy(() => import('./Pages/CertificatesPage'))
const NotFoundPage = lazy(() => import('./Pages/NotFoundPage'))

function firstBoot(): boolean {
  try {
    return shouldBoot(window.sessionStorage)
  } catch {
    return true
  }
}

export default function App() {
  const [booting, setBooting] = useState(firstBoot)

  // index.html paints the boot colour before JS runs (data-boot); drop it once the boot is over.
  useLayoutEffect(() => {
    if (!booting) delete document.documentElement.dataset.boot
  }, [booting])

  return (
    <ThemeProvider>
      <BootContext value={booting}>
        <ScrollToTop />
        {booting && <BootScreen onDone={() => setBooting(false)} />}
        <div inert={booting}>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:slug" element={<CaseStudyPage />} />
              <Route path="/certificates" element={<CertificatesPage />} />
              <Route path="/certificates/:id" element={<CertificatesPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
      </BootContext>
    </ThemeProvider>
  )
}
