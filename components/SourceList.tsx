import { Job } from '@/lib/types'

type Props = {
  jobs: Job[]
}

export default function SourceList({ jobs }: Props) {
  const sources = jobs
    .filter(j => j.source)
    .reduce((acc, job) => {
      const source = job.source!
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const sorted = Object.entries(sources).sort((a, b) => b[1] - a[1])

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-sm">Jobbtips-källor</h3>
      </div>
      {sorted.length === 0 ? (
        <div className="p-4 text-center text-sm text-gray-500">Inga källor registrerade ännu</div>
      ) : (
        <div className="divide-y">
          {sorted.map(([source, count]) => (
            <div key={source} className="p-4 flex justify-between items-center">
              <span className="text-sm">{source}</span>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
