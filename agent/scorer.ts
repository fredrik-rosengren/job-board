import Anthropic from '@anthropic-ai/sdk'
import { RawJob } from './sources/jobtech.js'

type Profile = {
  titles: string[]
  skills: string[]
  location: string
  remote: boolean
  minSalary: number
  experienceYears: number
  description: string
}

type ScoredJob = RawJob & { score: number }

export async function scoreJobs(client: Anthropic, jobs: RawJob[], profile: Profile): Promise<ScoredJob[]> {
  if (jobs.length === 0) return []

  const chunks: RawJob[][] = []
  for (let i = 0; i < jobs.length; i += 10) chunks.push(jobs.slice(i, i + 10))

  const scored: ScoredJob[] = []

  for (const chunk of chunks) {
    const jobList = chunk.map((j, i) => `${i}: ${j.title} @ ${j.company} (${j.location ?? 'okänd plats'})\n   ${j.description.slice(0, 200)}`).join('\n\n')

    const res = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Score these job listings 0-100 for match against this candidate profile.

PROFILE:
- Desired titles: ${profile.titles.join(', ')}
- Skills: ${profile.skills.join(', ')}
- Location preference: ${profile.location}${profile.remote ? ' (also open to remote)' : ''}
- Min salary: ${profile.minSalary} SEK/month
- Experience: ${profile.experienceYears} years
- Summary: ${profile.description}

SCORING GUIDE:
- 80-100: Excellent match (right title, relevant skills, good location)
- 60-79: Good match (similar title or relevant skills)
- 40-59: Partial match (adjacent role, some overlap)
- 20-39: Weak match
- 0-19: Poor match

JOBS:
${jobList}

Return a JSON array of scores only, in the same order. Example: [82, 45, 67, ...]
Return only the JSON array, no explanation.`,
      }],
    })

    const text = res.content.find(b => b.type === 'text')
    if (!text || text.type !== 'text') {
      scored.push(...chunk.map(j => ({ ...j, score: 50 })))
      continue
    }

    try {
      const match = text.text.match(/\[[\s\S]*?\]/)
      if (!match) throw new Error('no array')
      const scores = JSON.parse(match[0]) as number[]
      chunk.forEach((j, i) => scored.push({ ...j, score: scores[i] ?? 50 }))
    } catch {
      scored.push(...chunk.map(j => ({ ...j, score: 50 })))
    }
  }

  return scored
}
