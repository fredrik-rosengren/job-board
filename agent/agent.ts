import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { fetchJobtechJobs } from './sources/jobtech.js'
import { fetchWebJobs } from './sources/websearch.js'
import { scoreJobs } from './scorer.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf-8'))

const { profile, search, api } = config

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
if (!ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY saknas. Sätt den med: export ANTHROPIC_API_KEY=sk-ant-...')
  process.exit(1)
}

const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

async function getExistingUrls(): Promise<Set<string>> {
  try {
    const res = await fetch(`${api.jobBoardUrl}/api/jobs`)
    const jobs = await res.json() as { url: string | null }[]
    return new Set(jobs.map(j => j.url).filter(Boolean) as string[])
  } catch {
    return new Set()
  }
}

async function postJob(job: {
  title: string; company: string; location: string | null
  url: string; description: string; salary: string | null
  score: number; source: string
}) {
  const res = await fetch(`${api.jobBoardUrl}/api/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(job),
  })
  return res.ok
}

async function run() {
  console.log('🔍 Startar jobbagent...')
  console.log(`   Söker efter: ${profile.titles.slice(0, 3).join(', ')}`)
  console.log(`   Plats: ${profile.location}${profile.remote ? ' + remote' : ''}`)
  console.log()

  const existingUrls = await getExistingUrls()
  console.log(`📋 ${existingUrls.size} jobb redan i borden`)

  // Fetch from sources
  const allJobs: any[] = []

  if (search.sites.includes('arbetsformedlingen')) {
    console.log('📡 Hämtar från Arbetsförmedlingen...')
    const afjobs = await fetchJobtechJobs(search.keywords, search.maxJobsPerRun)
    console.log(`   Hittade ${afjobs.length} jobb`)
    allJobs.push(...afjobs)
  }

  const webSites = search.sites.filter((s: string) => s !== 'arbetsformedlingen')
  if (webSites.length > 0) {
    console.log(`🌐 Söker på ${webSites.join(', ')} via web search...`)
    const webJobs = await fetchWebJobs(client, search.keywords, profile.location, search.sites)
    console.log(`   Hittade ${webJobs.length} jobb`)
    allJobs.push(...webJobs)
  }

  // Filter already saved
  const newJobs = allJobs.filter(j => !existingUrls.has(j.url))
  console.log(`\n✨ ${newJobs.length} nya jobb att bearbeta (${allJobs.length - newJobs.length} dubbletter ignorerade)`)

  if (newJobs.length === 0) {
    console.log('Inga nya jobb hittades.')
    return
  }

  // Score
  console.log('\n🤖 Scorer matchning med Claude...')
  const scored = await scoreJobs(client, newJobs, profile)

  // Filter by min score and post
  const qualified = scored
    .filter(j => j.score >= search.minScore)
    .sort((a, b) => b.score - a.score)

  console.log(`\n💾 Sparar ${qualified.length} jobb (score ≥ ${search.minScore})...`)

  let saved = 0
  for (const job of qualified) {
    const ok = await postJob(job)
    if (ok) {
      saved++
      console.log(`   ✓ [${job.score}] ${job.title} @ ${job.company}`)
    }
  }

  console.log(`\n✅ Klart! ${saved} jobb sparade i job board → ${api.jobBoardUrl}`)
}

run().catch(err => {
  console.error('❌ Agent kraschade:', err.message)
  process.exit(1)
})
