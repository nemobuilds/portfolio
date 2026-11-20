export type VerifyType = 'credly' | 'coursera' | 'linkedin' | 'microsoft' | 'other'

// Filter groups on /certificates, in display order. A certification lists any
// of these names in `categories`. A category with no certifications gets no checkbox.
export const CERT_FACETS = [
  {
    key: 'topic',
    label: 'Topic',
    options: ['Programming', 'Cloud', 'AI', 'Data', 'DevOps & Containers', 'Security & Networking', 'Software Engineering'],
  },
  {
    // Certification: an exam you passed. Course: a finished course. Event: a hackathon or skills event.
    key: 'type',
    label: 'Type',
    options: ['Certification', 'Course', 'Event'],
  },
] as const

export type CertCategory = (typeof CERT_FACETS)[number]['options'][number]
export const CERT_CATEGORIES: readonly CertCategory[] = CERT_FACETS.flatMap((f) => f.options)

export type Certificate = {
  id: string
  name: string
  categories: CertCategory[]
  shortName?: string
  issuer: string
  via?: string
  issued?: string // YYYY-MM
  verifyUrl?: string
  verifyType?: VerifyType
  scan?: string // relative path to image
  home?: boolean
  homeOrder?: number
}

const all: Certificate[] = [
  {
    id: 'az-900',
    name: 'Microsoft Azure Fundamentals',
    categories: ['Cloud', 'Certification'],
    shortName: 'AZ-900',
    issuer: 'Microsoft',
    via: 'Pearson Vue',
    issued: '2026-09',
    verifyType: 'microsoft',
    verifyUrl: 'https://learn.microsoft.com/en-us/users/johnrogeeturqueza-6273/credentials/981bbfa4739a2e14',
    scan: '/images/certifications/azure-fundamentals.webp',
    home: true,
    homeOrder: 1,
  },
  {
    id: 'pcap',
    name: 'PCAP: Programming Essentials in Python',
    categories: ['Programming', 'Course'],
    issuer: 'Cisco Networking Academy & OpenEDG Python Institute',
    issued: '2022-12',
    verifyType: 'linkedin',
    verifyUrl:
      'https://www.linkedin.com/in/jrogeet/details/certifications/1734626606926/single-media-viewer?type=DOCUMENT&profileId=ACoAAEJd4MEBcNifXTtCX7fSTLw2-bqBBsTXlC0&lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_certifications_details%3BkUL923axQFCs%2FlHOFgF%2Bxg%3D%3D',
    home: true,
    homeOrder: 3,
    scan: '/images/certifications/pcap-programming-essentials-python.webp',
  },
  {
    id: 'ccst-cybersecurity',
    name: 'Cisco Certified Support Technician Cybersecurity',
    categories: ['Security & Networking', 'Certification'],
    shortName: 'CCST Cybersecurity',
    issuer: 'Cisco',
    via: 'Certiport',
    issued: '2025-04',
    verifyType: 'credly',
    verifyUrl: 'https://www.credly.com/badges/bc2ec00f-6132-4eaf-ab01-6a4c0a89d89c/linked_in_profile',
    home: true,
    homeOrder: 2,
    scan: '/images/certifications/ccst-cybersecurity.webp',
  },
  {
    id: 'intro-software-engineering',
    name: 'Introduction to Software Engineering',
    categories: ['Software Engineering', 'Course'],
    issuer: 'IBM',
    via: 'Coursera',
    issued: '2024-12',
    verifyType: 'coursera',
    verifyUrl: 'https://www.coursera.org/account/accomplishments/verify/MIOS4AP9U8C6',
    scan: '/images/certifications/ibm-intro-soft-engineering.webp',
  },
  {
    id: 'ai-skills-fest-2026',
    name: 'AI Skills Fest 2026',
    categories: ['AI', 'Event'],
    issuer: 'Microsoft',
    issued: '2026-06',
    verifyType: 'credly',
    verifyUrl: 'https://www.credly.com/badges/8a23b4ae-ef2c-4f0c-bb6d-27ca191ce913/linked_in_profile',
  },
  {
    id: 'understanding-data-engineering',
    name: 'Understanding Data Engineering',
    categories: ['Data', 'Course'],
    issuer: 'DataCamp',
    issued: '2025-09',
    verifyType: 'other',
    verifyUrl: 'https://www.datacamp.com/completed/statement-of-accomplishment/course/5d4813326af1fbe33bf167c365596b4bff8f2bc7',
    scan: '/images/certifications/datacamp-understanding-data-engineering.webp',
  },
  {
    id: 'intermediate-python',
    name: 'Intermediate Python',
    categories: ['Programming', 'Data', 'Course'],
    issuer: 'DataCamp',
    issued: '2025-07',
    verifyType: 'other',
    verifyUrl: 'https://www.datacamp.com/completed/statement-of-accomplishment/course/326fce20cf7b5d68a747db9e4dea6eea98efc1c6',
    scan: '/images/certifications/datacamp-intermediate-python.webp',
  },
  {
    id: 'containerization-virtualization',
    name: 'Containerization and Virtualization Concepts',
    categories: ['DevOps & Containers', 'Cloud', 'Course'],
    issuer: 'DataCamp',
    issued: '2025-07',
    verifyType: 'other',
    verifyUrl: 'https://www.datacamp.com/completed/statement-of-accomplishment/course/b0998eb702f50b388e3aeaab84ada6f6422d53f6',
    scan: '/images/certifications/datacamp-containerization-and-virtualization.webp',
  },
  {
    id: 'python-for-developers',
    name: 'Introduction to Python for Developers',
    categories: ['Programming', 'Course'],
    issuer: 'DataCamp',
    issued: '2025-06',
    verifyType: 'other',
    verifyUrl: 'https://www.datacamp.com/completed/statement-of-accomplishment/course/6ef59e9e6c049624ec46f0d531525b099e57ebd8',
    scan: '/images/certifications/datacamp-intro-to-python-for-devs.webp',
  },
  {
    id: 'intro-python',
    name: 'Introduction to Python',
    categories: ['Programming', 'Data', 'Course'],
    issuer: 'DataCamp',
    issued: '2025-06',
    verifyType: 'other',
    verifyUrl: 'https://www.datacamp.com/completed/statement-of-accomplishment/course/bb2a7a120e3a20eee05789327a5ad2eb8c3d7696',
    scan: '/images/certifications/datacamp-intro-to-python.webp',
  },
  {
    id: 'innolympics-2025',
    name: 'InnOlympics 2025 Hackathon, Certificate of Participation',
    shortName: 'InnOlympics 2025',
    categories: ['Software Engineering', 'Event'],
    issuer: 'Google Developer Groups on Campus PLM',
    issued: '2025-01',
    scan: '/images/certifications/innolympics-cert-of-participation.webp',
  },
  {
    id: 'software-engineering-essentials',
    name: 'Software Engineering Essentials',
    categories: ['Software Engineering', 'Course'],
    issuer: 'IBM',
    via: 'Coursera',
    issued: '2024-12',
    verifyType: 'credly',
    verifyUrl: 'https://www.credly.com/badges/3abafac8-749a-4027-99c7-db5d285b3abc/linked_in_profile',
    scan: '/images/certifications/ibm-softeng-essentials.webp',
  },
  {
    id: 'intro-packet-tracer',
    name: 'Introduction to Packet Tracer',
    categories: ['Security & Networking', 'Course'],
    issuer: 'Cisco Networking Academy',
    issued: '2023-12',
    scan: '/images/certifications/intro-to-packet-tracer.webp',
  },
  {
    id: 'integrated-programming-technologies-1',
    name: 'Integrated Programming Technologies 1',
    categories: ['Programming', 'Course'],
    issuer: 'CodeChum',
    issued: '2022-12',
    scan: '/images/certifications/codechum-integrated-programming.webp',
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
    case 'microsoft': return 'Verify on Microsoft Learn'
    default: return 'View credential'
  }
}
