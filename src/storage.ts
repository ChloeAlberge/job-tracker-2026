import type { JobApplication } from './types'
import { isJobApplication, type ApplicationDraft } from './validation'

const STORAGE_KEY = 'job-tracker-2026:applications'
const BACKUP_KEY = 'job-tracker-2026:backup'

export function loadApplications(): JobApplication[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('Format inattendu')

    const valid = parsed.filter(isJobApplication)
    if (valid.length !== parsed.length) {
      console.warn(`${parsed.length - valid.length} candidature(s) invalide(s) ignorée(s)`)
      localStorage.setItem(BACKUP_KEY, raw)
    }
    return valid
  } catch {
    // Données illisibles : on les met de côté au lieu de les écraser
    localStorage.setItem(BACKUP_KEY, raw)
    return []
  }
}

function saveApplications(list: JobApplication[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function addApplication(draft: ApplicationDraft): JobApplication[] {
  const now = new Date().toISOString()
  const newApplication: JobApplication = {
    ...draft,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  const list = [...loadApplications(), newApplication]
  saveApplications(list)
  return list
}

export function updateApplication(id: string, draft: ApplicationDraft): JobApplication[] {
  const now = new Date().toISOString()
  const list = loadApplications().map((app) =>
    app.id === id ? { ...app, ...draft, updatedAt: now } : app,
  )
  saveApplications(list)
  return list
}

export function deleteApplication(id: string): JobApplication[] {
  const list = loadApplications().filter((app) => app.id !== id)
  saveApplications(list)
  return list
}