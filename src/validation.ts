import { STATUSES, SOURCES, type JobApplication, type Status, type Source } from './types'

export type ApplicationDraft = Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>

export type FieldErrors = Partial<Record<keyof ApplicationDraft, string>>

export type ValidationResult =
  | { ok: true; value: ApplicationDraft }
  | { ok: false; errors: FieldErrors }

const MAX_TEXT = 200
const MAX_NOTES = 5000

const DRAFT_FIELDS: (keyof ApplicationDraft)[] = [
  'company', 'position', 'status', 'appliedAt', 'offerUrl',
  'source', 'contact', 'followUpAt', 'notes',
]

export function isStatus(value: unknown): value is Status {
  return typeof value === 'string' && (STATUSES as readonly string[]).includes(value)
}

export function isSource(value: unknown): value is Source {
  return typeof value === 'string' && (SOURCES as readonly string[]).includes(value)
}

// Date au format AAAA-MM-JJ qui existe vraiment (refuse 2026-02-31)
export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

// Seuls http et https sont acceptés (bloque javascript:, data:, etc.)
export function isSafeUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function toTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function checkText(value: string, label: string, max: number, required: boolean): string | undefined {
  if (required && !value) return `${label} obligatoire`
  if (value.length > max) return `${max} caractères maximum`
  return undefined
}

function checkDate(value: string, label: string): string | undefined {
  if (!value) return `${label} obligatoire`
  if (!isValidDate(value)) return 'Date invalide'
  return undefined
}

export function validateDraft(input: Record<string, unknown>): ValidationResult {
  const company = toTrimmedString(input.company)
  const position = toTrimmedString(input.position)
  const status = toTrimmedString(input.status)
  const appliedAt = toTrimmedString(input.appliedAt)
  const offerUrl = toTrimmedString(input.offerUrl)
  const source = toTrimmedString(input.source)
  const contact = toTrimmedString(input.contact)
  const followUpAt = toTrimmedString(input.followUpAt)
  const notes = toTrimmedString(input.notes)

  const errors: FieldErrors = {}
  const set = (key: keyof ApplicationDraft, message: string | undefined) => {
    if (message) errors[key] = message
  }

  set('company', checkText(company, 'Entreprise', MAX_TEXT, true))
  set('position', checkText(position, 'Poste', MAX_TEXT, true))
  set('contact', checkText(contact, 'Contact', MAX_TEXT, true))
  set('notes', checkText(notes, 'Notes', MAX_NOTES, false))
  set('appliedAt', checkDate(appliedAt, 'Date de candidature'))
  set('followUpAt', checkDate(followUpAt, 'Date de relance'))

  if (!offerUrl) set('offerUrl', "Lien de l'offre obligatoire")
  else if (!isSafeUrl(offerUrl)) set('offerUrl', 'Le lien doit commencer par http:// ou https://')

  if (!isStatus(status)) set('status', 'Statut invalide')
  if (!isSource(source)) set('source', 'Source invalide')

  if (Object.keys(errors).length > 0 || !isStatus(status) || !isSource(source)) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    value: { company, position, status, appliedAt, offerUrl, source, contact, followUpAt, notes },
  }
}

// Vérifie qu'une donnée relue depuis le stockage est bien une candidature complète
export function isJobApplication(value: unknown): value is JobApplication {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>

  const metaOk =
    typeof obj.id === 'string' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  const fieldsAreStrings = DRAFT_FIELDS.every((key) => typeof obj[key] === 'string')

  return metaOk && fieldsAreStrings && validateDraft(obj).ok
}