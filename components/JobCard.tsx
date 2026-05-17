'use client'

import { Job, STAGES } from '@/lib/types'
import ScoreBar from './ScoreBar'

type Props = {
  job: Job
  onUpdate: (job: Job) => void
  onDelete: (id: number) => void
}

export default function JobCard({ job, onUpdate, onDelete }: Props) {
  async function patch(fields: Partial<Job>) {
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    const updated = await res.json()
    onUpdate(updated)
  }

  async function remove() {
    if (!confirm(`Ta bort "${job.title}" hos ${job.company}?`)) return
    await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' })
    onDelete(job.id)
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

      <div className="flex gap-2 items-center pt-1">
        {job.url && (
          <a href={job.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">Öppna annons →</a>
        )}
        <button onClick={remove} className="ml-auto text-xs text-red-400 hover:text-red-600">Ta bort</button>
      </div>
    </div>
  )
}
