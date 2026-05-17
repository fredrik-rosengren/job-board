'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Job, STAGES } from '@/lib/types'
import StatCard from '@/components/StatCard'
import SourceList from '@/components/SourceList'

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/jobs')
      .then(r => r.json())
      .then(setJobs)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="p-4">Laddar...</div>
  }

  const stageStats = STAGES.map(s => ({
    ...s,
    count: jobs.filter(j => j.stage === s.id).length,
  }))

  const upcomingDeadlines = jobs
    .filter(j => j.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5)

  const educationStats = jobs
    .filter(j => j.education_level)
    .reduce((acc, job) => {
      acc[job.education_level!] = (acc[job.education_level!] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('sv-SE')
  }

  const isUpcoming = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntil <= 7 && daysUntil >= 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-lg font-bold text-indigo-700 hover:text-indigo-600">
            Job Board
          </Link>
          <nav className="flex gap-4 ml-auto">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Jobbvy
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold text-indigo-700">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Ansökningsöversikt</h1>
          <p className="text-gray-600">Statistik över din jobbsökning</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Totalt jobb" value={jobs.length} icon="📊" color="indigo" />
          {stageStats.map((s, i) => (
            <StatCard
              key={s.id}
              label={s.label}
              value={s.count}
              color={(['indigo', 'blue', 'green', 'orange', 'indigo'] as const)[i]}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SourceList jobs={jobs} />

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-sm">Utbildningskrav</h3>
            </div>
            {Object.keys(educationStats).length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">Ingen data än</div>
            ) : (
              <div className="divide-y">
                {Object.entries(educationStats)
                  .sort((a, b) => b[1] - a[1])
                  .map(([level, count]) => (
                    <div key={level} className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{level}</span>
                        <span className="text-xs text-gray-600">{count} jobb</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${(count / jobs.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-sm">Deadlines nästa 7 dagar</h3>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">Inga deadlines inom nästa vecka</div>
          ) : (
            <div className="divide-y">
              {upcomingDeadlines.map(job => (
                <div key={job.id} className="p-4 flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{job.title}</p>
                    <p className="text-xs text-gray-600">{job.company}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-sm font-semibold ${
                        isUpcoming(job.deadline!)
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {formatDate(job.deadline!)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.ceil(
                        (new Date(job.deadline!).getTime() - new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{' '}
                      dagar
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
