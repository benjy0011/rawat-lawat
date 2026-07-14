import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PendingPatient } from '../../data/pendingPatients'
import type {
  GlStatus,
  SourceDocument,
  ValidationRule,
} from '../../types/guaranteeLetter'
import { initialSourceDocuments } from '../../types/guaranteeLetter'
import { Icon } from '../Icon'
import { AdminShell } from './AdminShell'
import { AiReviewPanel } from './AiReviewPanel'
import { SourceDocuments } from './SourceDocuments'
import { SubmissionPanel } from './SubmissionPanel'

function createInitialRules(patient: PendingPatient): ValidationRule[] {
  return [
    {
      id: 'identity',
      label: 'Patient identity verified',
      detail: `Digital insurance handshake matches ${patient.name}.`,
      complete: true,
    },
    {
      id: 'policy',
      label: 'Active policy and member ID',
      detail: `${patient.insurer} member ${patient.memberId} is active.`,
      complete: true,
    },
    {
      id: 'diagnosis',
      label: 'ICD-10 diagnosis captured',
      detail: 'Requires the doctor note.',
      complete: false,
    },
    {
      id: 'cost',
      label: 'Estimated cost within balance',
      detail: 'Requires the doctor note.',
      complete: false,
    },
    {
      id: 'hospital',
      label: 'Panel hospital eligible',
      detail: 'Central Hospital HQ is an approved panel facility.',
      complete: true,
    },
  ]
}

export function HospitalAdminDashboard({ patient }: { patient: PendingPatient }) {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState(initialSourceDocuments)
  const [rules, setRules] = useState(() => createInitialRules(patient))
  const [isValidating, setIsValidating] = useState(false)
  const [status, setStatus] = useState<GlStatus>('PENDING_ADMIN_REVIEW')

  const doctorNoteUploaded = documents.some(
    document => document.id === 'doctor-notes' && document.fileName,
  )

  const uploadDocument = (id: SourceDocument['id'], file: File) => {
    setDocuments(current =>
      current.map(document =>
        document.id === id
          ? {
              ...document,
              fileName: file.name,
              previewUrl: URL.createObjectURL(file),
              uploadedAt: 'Uploaded just now',
            }
          : document,
      ),
    )

    if (id !== 'doctor-notes') return

    setIsValidating(true)

    window.setTimeout(() => {
      setRules(current =>
        current.map(rule => {
          if (rule.id === 'diagnosis') {
            return {
              ...rule,
              complete: true,
              detail: 'Acute gastroenteritis (A09) extracted from doctor note.',
            }
          }
          if (rule.id === 'cost') {
            return {
              ...rule,
              complete: true,
              detail: 'Estimated cost MYR 6,400; remaining limit MYR 127,500.',
            }
          }
          return rule
        }),
      )
      setIsValidating(false)
      setStatus('AI_VALIDATED')
    }, 1100)
  }

  const removeDocument = (id: SourceDocument['id']) => {
    setDocuments(current =>
      current.map(document => {
        if (document.id !== id) return document

        if (document.previewUrl) URL.revokeObjectURL(document.previewUrl)
        return initialSourceDocuments.find(source => source.id === id) ?? document
      }),
    )

    if (id === 'doctor-notes') {
      setRules(createInitialRules(patient))
      setStatus('PENDING_ADMIN_REVIEW')
      setIsValidating(false)
    }
  }

  const submit = () => {
    setStatus('SUBMITTING_TO_TPA')
    window.setTimeout(() => setStatus('GL_APPROVED'), 1800)
  }

  const progress =
    status === 'GL_APPROVED'
      ? 100
      : status === 'SUBMITTING_TO_TPA'
        ? 82
        : status === 'AI_VALIDATED'
          ? 65
          : 35

  return (
    <AdminShell>
      <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10">
        <DashboardHeader
          patient={patient}
          progress={progress}
          onBack={() => navigate('/admin/gl-process')}
        />
        <div className="mt-7 grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)_310px]">
          <SourceDocuments
            documents={documents}
            onUpload={uploadDocument}
            onRemove={removeDocument}
          />
          <section className="space-y-6">
            <PackageSummary
              patient={patient}
              doctorNoteUploaded={doctorNoteUploaded}
              status={status}
            />
            <Timeline
              patient={patient}
              doctorNoteUploaded={doctorNoteUploaded}
              status={status}
            />
          </section>
          <aside className="space-y-6">
            <AiReviewPanel
              isValidating={isValidating}
              rules={rules}
              documentReady={doctorNoteUploaded}
            />
            <SubmissionPanel
              status={status}
              disabled={status !== 'AI_VALIDATED'}
              onSubmit={submit}
            />
          </aside>
        </div>
      </main>
    </AdminShell>
  )
}

function DashboardHeader({
  patient,
  progress,
  onBack,
}: {
  patient: PendingPatient
  progress: number
  onBack: () => void
}) {
  return <><div className="flex flex-wrap items-start justify-between gap-4"><div><button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-[#555f6c] hover:text-[#003d9b]"><Icon name="back" className="h-4 w-4" />Pending completion</button><div className="mt-3 flex gap-2 text-sm text-[#555f6c]"><span>Admissions</span><span>/</span><span>Process GL</span></div><h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#151c27] sm:text-3xl">Admission GL processing <span className="hidden sm:inline">(Patient: {patient.name})</span></h1><p className="mt-2 text-sm text-[#555f6c] sm:hidden">Patient: {patient.name}</p></div><span className="inline-flex items-center gap-2 rounded-xl bg-[#72fe88] px-3 py-1.5 text-xs font-bold text-[#002107]"><span className="h-2 w-2 rounded-full bg-[#004f1b]" />Live verification</span></div><div className="mt-6 h-1 overflow-hidden rounded-full bg-[#dce2f3]"><div className="h-full rounded-full bg-[#003d9b] transition-all duration-500" style={{ width: `${progress}%` }} /></div></>
}

function PackageSummary({
  patient,
  doctorNoteUploaded,
  status,
}: {
  patient: PendingPatient
  doctorNoteUploaded: boolean
  status: GlStatus
}) {
  const statusTone =
    status === 'AI_VALIDATED' || status === 'GL_APPROVED'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-[#f0f3ff] text-[#003d9b]'

  return <article className="rounded-xl border border-[#c3c6d6] bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.08em] text-[#003d9b]">GL submission package</p><h2 className="mt-2 text-xl font-semibold">Clinical and policy summary</h2><p className="mt-2 text-sm text-[#555f6c]">A structured submission is assembled as source documents are verified.</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone}`}>{status.replaceAll('_', ' ')}</span></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><Summary label="Patient" value={patient.name} /><Summary label="Insurer" value={patient.insurer} /><Summary label="Policy plan" value={patient.policyPlan} /><Summary label="Member ID" value={patient.memberId} /><Summary label="Diagnosis" value={doctorNoteUploaded ? 'Acute gastroenteritis (A09)' : 'Awaiting doctor note'} /><Summary label="Estimated cost" value={doctorNoteUploaded ? 'MYR 6,400' : 'Awaiting doctor note'} /></div></article>
}

function Timeline({
  patient,
  doctorNoteUploaded,
  status,
}: {
  patient: PendingPatient
  doctorNoteUploaded: boolean
  status: GlStatus
}) {
  return <article className="rounded-xl border border-[#c3c6d6] bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[#f0f3ff] text-[#003d9b]"><Icon name="clipboard" className="h-5 w-5" /></span><div><h2 className="font-semibold">Submission timeline</h2><p className="text-sm text-[#555f6c]">Every validation action is recorded for {patient.name}&apos;s package.</p></div></div><ol className="mt-5 space-y-3 border-l border-[#dce2f3] pl-4 text-sm"><li><span className="font-bold text-[#003d9b]">10:39 AM</span> - Patient policy verified from Policy Vault</li><li><span className="font-bold text-[#003d9b]">10:40 AM</span> - Insurance card OCR record matched</li>{doctorNoteUploaded && <li><span className="font-bold text-[#003d9b]">Now</span> - Doctor note parsed and GL draft updated</li>}{status === 'GL_APPROVED' && <li><span className="font-bold text-emerald-700">Approved</span> - Mock TPA response received</li>}</ol></article>
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-[#f8faff] p-3"><p className="text-xs font-semibold uppercase tracking-wide text-[#555f6c]">{label}</p><p className="mt-1 text-sm font-semibold text-[#151c27]">{value}</p></div>
}
