// Statuts possibles d'une candidature
export const STATUSES = [
  'to_apply',
  'applied',
  'followed_up',
  'interview',
  'offer',
  'rejected',
  'abandoned',
] as const

export type Status = (typeof STATUSES)[number]

export const STATUS_LABELS: Record<Status, string> = {
  to_apply: 'À postuler',
  applied: 'Candidature envoyée',
  followed_up: 'Relancée',
  interview: 'Entretien',
  offer: 'Offre reçue',
  rejected: 'Candidature refusée',
  abandoned: 'Abandonnée',
}

// Origines possibles d'une candidature
export const SOURCES = [
  'linkedin',
  'wttj',
  'indeed',
  'apec',
  'france_travail',
  'hellowork',
  'company_site',
  'spontaneous',
  'network',
  'recruiter',
  'event',
  'other',
] as const

export type Source = (typeof SOURCES)[number]

export const SOURCE_LABELS: Record<Source, string> = {
  linkedin: 'LinkedIn',
  wttj: 'Welcome to the Jungle',
  indeed: 'Indeed',
  apec: 'APEC',
  france_travail: 'France Travail',
  hellowork: 'HelloWork',
  company_site: "Site de l'entreprise",
  spontaneous: 'Candidature spontanée',
  network: 'Réseau / cooptation',
  recruiter: 'Cabinet de recrutement / chasseur',
  event: 'Salon / événement',
  other: 'Autre',
}

// Une candidature
export interface JobApplication {
  id: string
  company: string
  position: string
  status: Status
  appliedAt: string   // date au format AAAA-MM-JJ
  offerUrl: string
  source: Source
  contact: string
  followUpAt: string  // date au format AAAA-MM-JJ
  notes: string       // peut être vide
  createdAt: string   // date et heure ISO, remplie automatiquement
  updatedAt: string   // date et heure ISO, remplie automatiquement
}