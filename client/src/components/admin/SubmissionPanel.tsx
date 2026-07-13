import type { GlStatus } from '../../types/guaranteeLetter'
import { Icon } from '../Icon'

type Props = { status: GlStatus; disabled: boolean; onSubmit: () => void }

export function SubmissionPanel({ status, disabled, onSubmit }: Props) {
  const approved = status === 'GL_APPROVED'
  const submitting = status === 'SUBMITTING_TO_TPA'
  const title = approved ? 'Guarantee letter approved' : submitting ? 'Submitting to TPA' : 'Ready for submission'
  const description = approved ? 'The simulated insurer response has approved this GL package.' : submitting ? 'The Portal Bridge is delivering the package to the mocked insurer endpoint.' : 'Send the validated package through the Portal Bridge.'
  return <section className={`rounded-xl p-5 text-white ${approved ? 'bg-emerald-700' : 'bg-[#003d9b]'}`}><p className="text-xs font-bold uppercase tracking-[.08em] text-blue-100">Portal Bridge</p><h2 className="mt-2 text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-5 text-blue-100">{description}</p>{approved ? <div className="mt-5 flex items-center gap-2 rounded-lg bg-white/15 px-3 py-3 text-sm font-semibold"><Icon name="check" className="h-5 w-5" />GL reference: AIA-GL-2026-0714</div> : <button disabled={disabled || submitting} onClick={onSubmit} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-bold text-[#003d9b] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white/60">{submitting ? 'Sending package…' : 'Submit for final approval'}<Icon name={submitting ? 'refresh' : 'send'} className={`h-4 w-4 ${submitting ? 'animate-spin' : ''}`} /></button>}</section>
}
