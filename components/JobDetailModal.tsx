'use client'

import { useState } from 'react'
import { Job } from '@/lib/types'

type Props = {
  job: Job
  onClose: () => void
  onUpdate: (job: Job) => void
}

const EDUCATION_LEVELS = ['Grundskola', 'Gymnasium', 'Högskola', 'Mastergrad', 'Övrigt']

export default function JobDetailModal({ job, onClose, onUpdate }: Props) {
  const [form, setForm] = useState(job)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const updated = await res.json()
    onUpdate(updated)
    onClose()
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    return dateStr.split('T')[0]
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h2 className="font-semibold text-lg">{form.title}</h2>
            <p className="text-sm text-gray-600">{form.company}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Titel</label>
              <input
                className="input mt-1"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Företag</label>
              <input
                className="input mt-1"
                value={form.company}
                onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Plats</label>
              <input
                className="input mt-1"
                value={form.location || ''}
                onChange={e => setForm(f => ({ ...f, location: e.target.value || null }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Lön</label>
              <input
                className="input mt-1"
                value={form.salary || ''}
                onChange={e => setForm(f => ({ ...f, salary: e.target.value || null }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Deadline</label>
              <input
                type="date"
                className="input mt-1"
                value={formatDate(form.deadline)}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value || null }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Utbildningsnivå</label>
              <select
                className="input mt-1"
                value={form.education_level || ''}
                onChange={e => setForm(f => ({ ...f, education_level: e.target.value || null }))}
              >
                <option value="">Välj nivå</option>
                {EDUCATION_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">URL</label>
            <input
              type="url"
              className="input mt-1"
              value={form.url || ''}
              onChange={e => setForm(f => ({ ...f, url: e.target.value || null }))}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Källa</label>
            <input
              className="input mt-1"
              placeholder="LinkedIn, Arbetsförmedlingen, etc."
              value={form.source || ''}
              onChange={e => setForm(f => ({ ...f, source: e.target.value || null }))}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Match-score: {form.score}/100</label>
            <input
              type="range"
              min="0"
              max="100"
              className="w-full mt-2"
              value={form.score}
              onChange={e => setForm(f => ({ ...f, score: parseInt(e.target.value) }))}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Beskrivning</label>
            <textarea
              className="input mt-1 h-24 resize-none"
              value={form.description || ''}
              onChange={e => setForm(f => ({ ...f, description: e.target.value || null }))}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">📝 Anteckningar (fri text)</label>
            <textarea
              className="input mt-1 h-32 resize-none focus:ring-yellow-400 border-yellow-300 focus:border-yellow-300"
              placeholder="Lägg till egna anteckningar, tankar, intervjunsvar..."
              value={form.notes || ''}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value || null }))}
            />
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Avbryt
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
            >
              {saving ? 'Sparar...' : 'Spara ändringar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
