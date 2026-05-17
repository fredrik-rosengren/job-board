export type Job = {
  id: number
  title: string
  company: string
  location: string | null
  url: string | null
  description: string | null
  score: number
  stage: 'new' | 'relevant' | 'applied' | 'interview' | 'rejected'
  relevant: number
  notes: string | null
  source: string | null
  salary: string | null
  deadline: string | null
  education_level: string | null
  created_at: string
  updated_at: string
}

export const STAGES = [
  { id: 'new', label: 'Ny' },
  { id: 'relevant', label: 'Relevant' },
  { id: 'applied', label: 'Ansökt' },
  { id: 'interview', label: 'Intervju' },
  { id: 'rejected', label: 'Avslag' },
] as const
