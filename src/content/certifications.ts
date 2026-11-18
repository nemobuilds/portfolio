export type VerifyType = 'credly' | 'coursera' | 'linkedin' | 'other'

export type Certificate = {
  id: string
  name: string
  shortName?: string
  issuer: string
  via?: string
  issued?: string // YYYY-MM
  verifyUrl?: string
  verifyType?: VerifyType
  scan?: string
  home?: boolean
  homeOrder?: number
}

const all: Certificate[] = [
  {
    id: 'pcap',
    name: 'PCAP: Programming Essentials in Python',
    issuer: 'Cisco Networking Academy & OpenEDG Python Institute',
    verifyType: 'linkedin',
    verifyUrl:
      'https://www.linkedin.com/in/jrogeet/details/certifications/1734626606926/single-media-viewer?type=DOCUMENT&profileId=ACoAAEJd4MEBcNifXTtCX7fSTLw2-bqBBsTXlC0&lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_certifications_details%3BkUL923axQFCs%2FlHOFgF%2Bxg%3D%3D',
    home: true,
    homeOrder: 3,
  },
  {
    id: 'ccst-cybersecurity',
    name: 'Cisco Certified Support Technician Cybersecurity',
    shortName: 'CCST Cybersecurity',
    issuer: 'Cisco',
    via: 'Certiport',
    issued: '2025-04',
    verifyType: 'credly',
    verifyUrl: 'https://www.credly.com/badges/bc2ec00f-6132-4eaf-ab01-6a4c0a89d89c/linked_in_profile',
    home: true,
    homeOrder: 1,
  },
  {
    id: 'intro-software-engineering',
    name: 'Introduction to Software Engineering',
    issuer: 'IBM',
    via: 'Coursera',
    issued: '2024-12',
    verifyType: 'coursera',
    verifyUrl: 'https://www.coursera.org/account/accomplishments/verify/MIOS4AP9U8C6',
    home: true,
    homeOrder: 2,
  },
]

// Newest first, undated last.
export const certificates: Certificate[] = [...all].sort((a, b) => {
  if (a.issued && b.issued) return b.issued.localeCompare(a.issued)
  if (a.issued) return -1
  if (b.issued) return 1
  return 0
})

export const homeCertificates: Certificate[] = certificates
  .filter((c) => c.home)
  .sort((a, b) => (a.homeOrder ?? 0) - (b.homeOrder ?? 0))
  .slice(0, 3)

export function getCertificate(id: string): Certificate | undefined {
  return certificates.find((c) => c.id === id)
}

export function verifyLabel(t?: VerifyType): string {
  switch (t) {
    case 'credly': return 'Verify on Credly'
    case 'coursera': return 'Verify on Coursera'
    case 'linkedin': return 'View on LinkedIn'
    default: return 'View credential'
  }
}
