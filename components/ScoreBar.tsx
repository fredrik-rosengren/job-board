'use client'

export default function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 75 ? 'bg-green-500' :
    score >= 50 ? 'bg-yellow-400' :
    score >= 25 ? 'bg-orange-400' :
    'bg-red-400'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold w-7 text-right text-gray-700">{score}</span>
    </div>
  )
}
