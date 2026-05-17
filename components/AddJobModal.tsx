'use client'

import { useState } from 'react'
import { Job } from '@/lib/types'

type Props = {
  onClose: () => void
  onAdded: (job: Job) => void
}

const EDUCATION_LEVELS = ['Grundskola', 'Gymnasium', 'Högskola', 'Mastergrad', 'Övrigt']

export default function AddJobModal({ onClose, onAdded }: Props) {
  const [form, setForm] = useState({
    title: '', company: '', location: '', url: '', salary: '', score: '50', description: '', notes: '', source: '', deadline: '', education_level: ''
  })
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, score: parseInt(form.score) }),
    })
    const job = await res.json()
    onAdded(job)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="font-semibold text-lg">Lägg till jobb</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Titel *</label>
              <input required className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Företag *</label>
              <input required className="input" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Plats</label>
              <input className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Lön</label>
              <input className="input" placeholder="t.ex. 60 000 kr/mån" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Deadline</label>
              <input type="date" className="input" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Utbildningsnivå</label>
              <select className="input" value={form.education_level} onChange={e => setForm(f => ({ ...f, education_level: e.target.value }))}>
                <option value="">Välj nivå</option>
                {EDUCATION_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">URL</label>
            <input className="input" type="url" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Källa (LinkedIn, Arbetsförmedlingen, etc.)</label>
            <input className="input" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Match-score: {form.score}/100</label>
            <input type="range" min="0" max="100" className="w-full mt-1" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Beskrivning</label>
            <textarea className="input h-20 resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Anteckningar</label>
            <textarea className="input h-16 resize-none" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Avbryt</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary">{saving ? 'Sparar…' : 'Spara'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
