import { useRef } from 'react'
import type { SourceDocument } from '../../types/guaranteeLetter'
import { Icon } from '../Icon'

type Props = {
  documents: SourceDocument[]
  onUpload: (id: SourceDocument['id'], file: File) => void
  onRemove: (id: SourceDocument['id']) => void
}

export function SourceDocuments({ documents, onUpload, onRemove }: Props) {
  return <section><div className="mb-4 flex items-center justify-between"><h2 className="text-xs font-bold uppercase tracking-[.08em] text-[#434654]">Available source documents</h2><span className="text-xs font-bold text-[#003d9b]">{documents.length} items</span></div><div className="space-y-3">{documents.map(document => <DocumentCard key={document.id} document={document} onUpload={onUpload} onRemove={onRemove} />)}</div><div className="mt-6 rounded-2xl bg-[#0052cc] p-6 text-white"><p className="text-sm font-bold">Next step recommendation</p><p className="mt-2 text-sm leading-5 text-blue-100">Upload the doctor's admission note. We will extract the diagnosis, ICD-10 code, and estimated cost before submission.</p></div></section>
}

function DocumentCard({ document, onUpload, onRemove }: { document: SourceDocument; onUpload: Props['onUpload']; onRemove: Props['onRemove'] }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const hasFile = Boolean(document.fileName)

  const remove = () => {
    if (inputRef.current) inputRef.current.value = ''
    onRemove(document.id)
  }

  return <article className={`rounded-lg border p-4 transition ${hasFile ? 'border-[#c3c6d6] bg-white' : 'border-dashed border-[#7da3dc] bg-[#f5f8ff]'}`}><input ref={inputRef} className="hidden" type="file" accept={document.acceptedTypes} onChange={event => { const file = event.target.files?.[0]; if (file) onUpload(document.id, file) }} /><div className="flex items-center gap-3"><span className={`grid h-11 w-11 place-items-center rounded-lg ${hasFile ? 'bg-[#d9e3f2] text-[#003d9b]' : 'bg-white text-[#0052cc]'}`}><Icon name="file" className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h3 className="text-sm font-bold text-[#151c27]">{document.fileName ?? document.name}</h3><p className="mt-0.5 text-xs leading-4 text-[#555f6c]">{document.fileName ? document.uploadedAt : document.description}</p></div></div>{!hasFile && <button onClick={() => inputRef.current?.click()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-[#9ab9e8] bg-white px-3 py-2 text-xs font-bold text-[#003d9b] hover:bg-blue-50"><Icon name="upload" className="h-4 w-4" />Upload document</button>}{hasFile && <div className="mt-3 flex flex-wrap items-center gap-2"><span className="mr-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><Icon name="check" className="h-4 w-4" />{document.uploadedAt}</span>{document.previewUrl && <button onClick={() => window.open(document.previewUrl, '_blank', 'noopener,noreferrer')} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-[#003d9b] hover:bg-[#f0f3ff]"><Icon name="eye" className="h-4 w-4" />Preview</button>}<button onClick={remove} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50"><Icon name="close" className="h-4 w-4" />Remove</button></div>}</article>
}
