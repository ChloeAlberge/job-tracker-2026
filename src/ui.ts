import { SOURCES, SOURCE_LABELS, STATUSES, STATUS_LABELS, type JobApplication } from './types'
import { DRAFT_FIELDS, isSafeUrl, validateDraft, type FieldErrors } from './validation'
import { addApplication, deleteApplication, loadApplications, updateApplication } from './storage'

// --- Récupération des éléments HTML (erreur claire si l'un d'eux manque) ---

function getElement<T extends HTMLElement>(id: string, type: { new (): T }): T {
  const element = document.getElementById(id)
  if (!(element instanceof type)) throw new Error(`Élément #${id} introuvable`)
  return element
}

const addButton = getElement('add-button', HTMLButtonElement)
const list = getElement('application-list', HTMLUListElement)
const emptyMessage = getElement('empty-message', HTMLParagraphElement)
const dialog = getElement('application-dialog', HTMLDialogElement)
const form = getElement('application-form', HTMLFormElement)
const formTitle = getElement('form-title', HTMLHeadingElement)
const deleteButton = getElement('delete-button', HTMLButtonElement)
const cancelButton = getElement('cancel-button', HTMLButtonElement)

let editingId: string | null = null

// --- Outils ---

// Crée un élément avec du texte : textContent, jamais innerHTML
function createTextElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text: string,
  className?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag)
  element.textContent = text
  if (className) element.className = className
  return element
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('fr-FR')
}

function getField(name: string): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  const field = form.elements.namedItem(name)
  if (
    field instanceof HTMLInputElement ||
    field instanceof HTMLSelectElement ||
    field instanceof HTMLTextAreaElement
  ) {
    return field
  }
  throw new Error(`Champ "${name}" introuvable`)
}

function populateSelect<T extends string>(name: string, values: readonly T[], labels: Record<T, string>): void {
  const select = getField(name)
  if (!(select instanceof HTMLSelectElement)) throw new Error(`"${name}" n'est pas une liste`)
  select.replaceChildren(...values.map((value) => new Option(labels[value], value)))
}

// --- Affichage de la liste ---

function createCard(app: JobApplication): HTMLLIElement {
  const card = document.createElement('li')
  card.className = 'card'

  card.append(
    createTextElement('h3', app.company),
    createTextElement('p', app.position, 'card-position'),
    createTextElement('span', STATUS_LABELS[app.status], `status status-${app.status}`),
    createTextElement('p', `Candidature le ${formatDate(app.appliedAt)} · ${SOURCE_LABELS[app.source]}`),
    createTextElement('p', `Contact : ${app.contact}`),
  )

  if (app.followUpAt) card.append(createTextElement('p', `Relance le ${formatDate(app.followUpAt)}`))
  if (app.notes) card.append(createTextElement('p', app.notes, 'card-notes'))

  const actions = document.createElement('div')
  actions.className = 'card-actions'

  if (isSafeUrl(app.offerUrl)) {
    const link = createTextElement('a', "Voir l'offre")
    link.href = app.offerUrl
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    actions.append(link)
  }

  const editButton = createTextElement('button', 'Modifier')
  editButton.type = 'button'
  editButton.addEventListener('click', () => openDialog(app))
  actions.append(editButton)

  card.append(actions)
  return card
}

function renderList(apps: JobApplication[]): void {
  emptyMessage.hidden = apps.length > 0
  const sorted = [...apps].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt))
  list.replaceChildren(...sorted.map(createCard))
}

// --- Formulaire ---

function showErrors(errors: FieldErrors): void {
  for (const key of DRAFT_FIELDS) {
    const span = form.querySelector(`[data-error-for="${key}"]`)
    if (span) span.textContent = errors[key] ?? ''
  }
}

function openDialog(app?: JobApplication): void {
  form.reset()
  showErrors({})
  editingId = app?.id ?? null
  formTitle.textContent = app ? 'Modifier la candidature' : 'Nouvelle candidature'
  deleteButton.hidden = !app

  if (app) {
    for (const key of DRAFT_FIELDS) getField(key).value = app[key]
  }

  dialog.showModal()
}

function handleSubmit(event: SubmitEvent): void {
  event.preventDefault()
  const result = validateDraft(Object.fromEntries(new FormData(form)))

  if (!result.ok) {
    showErrors(result.errors)
    return
  }

  try {
    const apps = editingId ? updateApplication(editingId, result.value) : addApplication(result.value)
    renderList(apps)
    dialog.close()
  } catch {
    alert("Impossible d'enregistrer la candidature.")
  }
}

function handleDelete(): void {
  if (!editingId || !confirm('Supprimer cette candidature ?')) return
  renderList(deleteApplication(editingId))
  dialog.close()
}

// --- Démarrage ---

export function initUI(): void {
  populateSelect('status', STATUSES, STATUS_LABELS)
  populateSelect('source', SOURCES, SOURCE_LABELS)

  addButton.addEventListener('click', () => openDialog())
  cancelButton.addEventListener('click', () => dialog.close())
  deleteButton.addEventListener('click', handleDelete)
  form.addEventListener('submit', handleSubmit)

  renderList(loadApplications())
}