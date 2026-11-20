import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Layout } from '../Components/Layout'
import CertificateCard, { issuerLine } from '../Components/CertificateCard'
import { CertificateDialog } from '../Components/CertificateDialog'
import { FilterLayout, SearchBox } from '../Components/Filters'
import NotFoundPage from './NotFoundPage'
import { CERT_FACETS, certificates, getCertificate, type Certificate } from '../content/certifications'
import { countWord } from '../content/count'
import { facetViews, filterItems, pickedList, type Accessors } from '../filter/filter'
import { useFilterParams } from '../filter/useFilterParams'

const SITE = 'John Rogee Turqueza'

const access: Accessors<Certificate> = {
  text: (c) => [c.name, c.shortName ?? '', issuerLine(c)].join(' '),
  categories: (c) => c.categories,
}

export default function CertificatesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const fromList = !!(location.state as { fromList?: boolean } | null)?.fromList
  const certificate = id ? getCertificate(id) : undefined
  const missing = !!id && !certificate
  const openedFromCard = useRef(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const lastId = useRef<string | undefined>(id)
  const { state, setQuery, toggle, clearAll } = useFilterParams(CERT_FACETS)

  useEffect(() => {
    if (missing) return
    document.title = certificate
      ? `${certificate.shortName ?? certificate.name} · Certifications · ${SITE}`
      : `Certifications · ${SITE}`
  }, [certificate, missing])

  // After the dialog closes, return focus to the card that opened it, or to the h1 on a deep link.
  useEffect(() => {
    const was = lastId.current
    lastId.current = id
    if (!was || id) return
    const target = openedFromCard.current
      ? document.querySelector<HTMLElement>(`[data-cert-id="${was}"]`)
      : heading.current
    target?.focus()
  }, [id])

  const close = useCallback(() => {
    if (fromList) navigate(-1)
    else navigate('/certificates', { replace: true })
  }, [navigate, fromList])

  if (missing) return <NotFoundPage />

  const index = certificate ? certificates.indexOf(certificate) : -1
  const shown = filterItems(certificates, state, CERT_FACETS, access)

  return (
    <Layout surface="sub" current="certifications">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <section className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 pt-12 pb-9">
          <div className="flex flex-col gap-3.5">
            <h1
              ref={heading}
              tabIndex={-1}
              className="m-0 text-[clamp(44px,5.5vw,68px)] font-bold leading-none tracking-[-0.035em] text-[var(--text)]"
            >
              Certifications
            </h1>
            <p className="m-0 text-[16px] text-[var(--text-secondary)] min-[760px]:text-[18px]">
              {countWord(certificates.length)} certifications. Each one links to its issuer.
            </p>
          </div>
          <SearchBox label="Search certifications" placeholder="Search by name or issuer" value={state.q} onChange={setQuery} />
        </section>
        <div
          className="pb-[88px]"
          onClickCapture={(e) => {
            if ((e.target as HTMLElement).closest('[data-cert-id]')) openedFromCard.current = true
          }}
        >
          <FilterLayout
            noun="certifications"
            singular="certification"
            views={facetViews(certificates, state, CERT_FACETS, access)}
            state={state}
            picked={pickedList(state, CERT_FACETS)}
            total={certificates.length}
            shown={shown.length}
            onToggle={toggle}
            onClearSearch={() => setQuery('')}
            onClearAll={clearAll}
          >
            <div className="grid grid-cols-1 items-stretch gap-x-7 gap-y-10 min-[640px]:grid-cols-2">
              {shown.map((c) => (
                <CertificateCard key={c.id} certificate={c} />
              ))}
            </div>
          </FilterLayout>
        </div>
      </div>
      {certificate && (
        <CertificateDialog
          certificate={certificate}
          previous={certificates[index - 1]}
          next={certificates[index + 1]}
          onClose={close}
        />
      )}
    </Layout>
  )
}
