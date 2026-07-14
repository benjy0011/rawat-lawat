import { useNavigate } from 'react-router-dom'
import { pendingPatients } from '../../data/pendingPatients'
import { Icon } from '../Icon'
import { AdminShell } from './AdminShell'

export function AdminPatientQueue() {
  const navigate = useNavigate()
  const urgentPatients = pendingPatients.filter(patient => patient.priority === 'Urgent').length

  return <AdminShell><main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex gap-2 text-sm text-[#555f6c]"><span>Admissions</span><span>›</span><span>Pending completion</span></div><h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#151c27] sm:text-3xl">Patients awaiting GL completion</h1><p className="mt-2 max-w-2xl text-sm text-[#555f6c]">Review each admission package, complete the missing clinical details, then submit the guarantee letter to the insurer.</p></div><div className="rounded-xl border border-[#c3c6d6] bg-white px-4 py-3 shadow-sm"><p className="text-xs font-bold uppercase tracking-[.08em] text-[#555f6c]">Pending queue</p><p className="mt-1 text-2xl font-semibold text-[#003d9b]">{pendingPatients.length} patients</p></div></div><section className="mt-7 overflow-hidden rounded-xl border border-[#c3c6d6] bg-white shadow-sm" aria-labelledby="pending-patients-heading"><div className="flex items-center justify-between border-b border-[#dce2f3] px-5 py-4"><div><h2 id="pending-patients-heading" className="font-semibold text-[#151c27]">Admission packages</h2><p className="mt-1 text-sm text-[#555f6c]">{urgentPatients} require priority review.</p></div><span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800"><span className="h-2 w-2 rounded-full bg-amber-500" />Awaiting admin action</span></div><div className="divide-y divide-[#dce2f3]">{pendingPatients.map(patient => <article key={patient.id} className="flex flex-col gap-4 px-5 py-5 transition hover:bg-[#f8faff] lg:flex-row lg:items-center"><div className="flex min-w-0 flex-1 items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#d9e3f2] text-sm font-bold text-[#003d9b]">{initials(patient.name)}</span><div className="min-w-0"><h3 className="truncate font-semibold text-[#151c27]">{patient.name}</h3><p className="mt-1 text-sm text-[#555f6c]">{patient.medicalRecordNumber} · {patient.admissionReason}</p></div></div><div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:flex sm:min-w-[365px] sm:justify-between"><Detail label="Insurer" value={patient.insurer} /><Detail label="Received" value={patient.requestedAt} /><div><p className="text-xs font-semibold uppercase tracking-wide text-[#555f6c]">Priority</p><span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${patient.priority === 'Urgent' ? 'bg-rose-50 text-rose-700' : 'bg-[#f0f3ff] text-[#003d9b]'}`}>{patient.priority}</span></div></div><button onClick={() => navigate(`/admin/gl-process/${patient.id}`)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#003d9b] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#002d73]">Review package<Icon name="arrow" className="h-4 w-4" /></button></article>)}</div></section></main></AdminShell>
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-semibold uppercase tracking-wide text-[#555f6c]">{label}</p><p className="mt-1 font-medium text-[#151c27]">{value}</p></div>
}

function initials(name: string) {
  return name.split(' ').map(part => part[0]).join('').slice(0, 2)
}
