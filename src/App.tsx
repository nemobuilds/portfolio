import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './theme/ThemeProvider'
import { HomePage, CaseStudyPage, CertificatesPage } from './Pages/stubs'
import NotFoundPage from './Pages/NotFoundPage'
import ProjectsPage from './Pages/ProjectsPage'

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<CaseStudyPage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/certificates/:id" element={<CertificatesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ThemeProvider>
  )
}
