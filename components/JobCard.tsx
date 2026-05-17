'use client'

import { useState } from 'react'
import { Job, STAGES } from '@/lib/types'
import ScoreBar from './ScoreBar'

type Props = {
  job: Job
  onUpdate: (job: Job) => void
  onDelete: (id: number) => void
}

export default function JobCard({ job, onUpdate, onDelete }: Props) {
  const [showNotes, setShowNotes] = useState(false)
  const [editingNotes, setEditingNotes] = useState(job.notes || '')

  async function patch(fields: Partial<Job>) {
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    const updated = await res.json()
    onUpdate(updated)
  }

  async function saveNotes() {
    await patch({ notes: editingNotes })
    setShowNotes(false)
  }

  async function remove() {
    if (!confirm(`Ta bort "${job.title}" hos ${job.company}?`)) return
    await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' })
    onDelete(job.id)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('sv-SE')
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm p-4 space-y-2 ${job.relevant ? 'border-green-400' : 'border-gray-200'}`}>
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="font-semibold text-sm leading-tight">{job.title}</p>
          <p className="text-xs text-gray-500">{job.company}{job.location ? ` · ${job.location}` : ''}</p>
        </div>
        <button
          onClick={() => patch({ relevant: job.relevant ? 0 : 1 } as Partial<Job>)}
          title="Markera relevant"
          className={`text-lg transition-transform hover:scale-110 ${job.relevant ? 'text-green-500' : 'text-gray-300'}`}
        >★</button>
      </div>

      <ScoreBar score={job.score} />

      {job.salary && <p className="text-xs text-gray-500">💰 {job.salary}</p>}

      <div className="flex gap-2 text-xs text-gray-500 flex-wrap">
        {job.deadline && <span>📅 Deadline: {formatDate(job.deadline)}</span>}
        {job.education_level && <span>🎓 {job.education_level}</span>}
        {job.source && <span>🔗 {job.source}</span>}
      </div>

      <div className="flex gap-1 flex-wrap">
        {STAGES.map(s => (
          <button
            key={s.id}
            onClick={() => patch({ stage: s.id } as Partial<Job>)}
            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
              job.stage === s.id
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-500 border-gray-300 hover:border-indigo-400'
            }`}
          >{s.label}</button>
        ))}
      </div>

      {showNotes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-2">
          <textarea
            value={editingNotes}
            onChange={e => setEditingNotes(e.target.value)}
            placeholder="Lägg till anteckningar..."
            className="w-full text-xs p-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setEditingNotes(job.notes || ''); setShowNotes(false) }}
              className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-200 rounded"
            >Avbryt</button>
            <button
              onClick={saveNotes}
              className="text-xs px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >Spara</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 items-center pt-1 flex-wrap">
        {job.url && (
          <a href={job.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">Öppna annons →</a>
        )}
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >{showNotes ? 'Dölj' : 'Anteckningar'} {job.notes ? '📝' : ''}</button>
        <button onClick={remove} className="ml-auto text-xs text-red-400 hover:text-red-600">Ta bort</button>
      </div>
    </div>
  )
}
