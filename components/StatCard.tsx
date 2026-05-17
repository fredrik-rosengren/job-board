type Props = {
  label: string
  value: string | number
  icon?: string
  color?: 'indigo' | 'blue' | 'green' | 'orange'
}

export default function StatCard({ label, value, icon, color = 'indigo' }: Props) {
  const colorClass = {
    indigo: 'bg-indigo-50 border-indigo-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
  }[color]

  return (
    <div className={`${colorClass} border rounded-lg p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-600 font-medium">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
    </div>
  )
}
