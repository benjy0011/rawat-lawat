export type GlStatus =
  | 'PENDING_ADMIN_REVIEW'
  | 'AI_VALIDATED'
  | 'SUBMITTING_TO_TPA'
  | 'GL_APPROVED'
  | 'GL_REJECTED'

export type SourceDocument = {
  id: 'doctor-notes' | 'lab-results' | 'insurance-card'
  name: string
  description: string
  uploadedAt: string
  acceptedTypes: string
  fileName?: string
  previewUrl?: string
}

export type ValidationRule = {
  id: string
  label: string
  detail: string
  complete: boolean
}

export const initialSourceDocuments: SourceDocument[] = [
  {
    id: 'doctor-notes',
    name: 'Doctor notes',
    description: 'Required for diagnosis and estimated cost.',
    uploadedAt: 'Not uploaded',
    acceptedTypes: '.pdf,.jpg,.jpeg,.png',
  },
  {
    id: 'lab-results',
    name: 'Lab results',
    description: 'Optional supporting clinical evidence.',
    uploadedAt: 'Uploaded 1h ago',
    acceptedTypes: '.pdf,.jpg,.jpeg,.png',
  },
  {
    id: 'insurance-card',
    name: 'Insurance card scan',
    description: 'Patient policy found in the Policy Vault.',
    uploadedAt: 'OCR verified',
    acceptedTypes: '.pdf,.jpg,.jpeg,.png',
    fileName: 'AIA_Medical_Card.pdf',
  },
]
