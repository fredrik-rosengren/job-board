'use client'

import { useEffect, useState } from 'react'
import { Job } from '@/lib/types'
import JobCard from '@/components/JobCard'
import KanbanBoard from '@/components/KanbanBoard'
import AddJobModal from '@/components/AddJobModal'

type View = 'list' | 'kanban'

const stages = ['new', 'relevant', 'applied', 'interview', 'rejected'] as const
const stageLabels: Record<string, string> = {
  new: 'Ny', relevant: 'Relevant', applied: 'Ansökt', interview: 'Intervju', rejected: 'Avslag'
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [view, setView] = useState<View>('kanban')
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [filterRelevant, setFilterRelevant] = useState(false)

  useEffect(() => {
    fetch('/api/jobs').then(r => r.json()).then(setJobs)
  }, [])

  function updateJob(updated: Job) {
    setJobs(jobs => jobs.map(j => j.id === updated.id ? updated : j))
  }

  function deleteJob(id: number) {
    setJobs(jobs => jobs.filter(j => j.id !== id))
  }

  const filtered = jobs.filter(j => {
    if (filterRelevant && !j.relevant) return false
    if (filterStage && j.stage !== filterStage) return false
    if (search) {
      const q = search.toLowerCase()
      return j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <h1 className="text-lg font-bold text-indigo-700 mr-2">Job Board</h1>
          <input
            type="text"
            placeholder="Sök titel eller företag…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-40 max-w-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <select
            value={filterStage}
            onChange={e => setFilterStage(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Alla steg</option>
            {stages.map(s => <option key={s} value={s}>{stageLabels[s]}</option>)}
          </select>
          <button
            onClick={() => setFilterRelevant(v => !v)}
            className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${filterRelevant ? 'bg-green-100 border-green-400 text-green-700' : 'bg-white border-gray-300 text-gray-600'}`}
          >★ Relevanta</button>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button onClick={() => setView('kanban')} className={`px-3 py-1.5 text-sm ${view === 'kanban' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Kanban</button>
            <button onClick={() => setView('list')} className={`px-3 py-1.5 text-sm ${view === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Lista</button>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >+ Lägg till</button>
        </div>
        <div className="max-w-screen-xl mx-auto px-4 pb-2 flex gap-4">
          {stages.map(s => (
            <span key={s} className="text-xs text-gray-500">
              {stageLabels[s]}: <strong>{jobs.filter(j => j.stage === s).length}</strong>
            </span>
          ))}
          <span className="text-xs text-gray-400 ml-auto">Totalt: {jobs.length} jobb</span>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {view === 'kanban' ? (
          <KanbanBoard jobs={filtered} onUpdate={updateJob} onDelete={deleteJob} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-16">
                Inga jobb hittades. Lägg till ett eller låt agenten fylla på!
              </div>
            )}
            {filtered.map(job => (
              <JobCard key={job.id} job={job} onUpdate={updateJob} onDelete={deleteJob} />
            ))}
          </div>
        )}
      </main>

      {showAdd && <AddJobModal onClose={() => setShowAdd(false)} onAdded={j => setJobs(jobs => [j, ...jobs])} />}
    </div>
  )
}
