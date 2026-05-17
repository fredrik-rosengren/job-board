import Anthropic from '@anthropic-ai/sdk'
import { RawJob } from './jobtech.js'

export async function fetchWebJobs(
  client: Anthropic,
  keywords: string[],
  location: string,
  sites: string[],
): Promise<RawJob[]> {
  const siteList = sites
    .filter(s => s !== 'arbetsformedlingen')
    .map(s => ({ linkedin: 'LinkedIn Jobs', indeed: 'Indeed', blocket: 'Blocketjobb' }[s] ?? s))
    .join(', ')

  if (!siteList) return []

  const query = `Find software developer job listings on ${siteList} for "${keywords[0]}" in ${location}. List 10 jobs with: title, company, location, URL, brief description, and salary if shown.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    tools: [{ type: 'web_search_20250305', name: 'web_search' } as any],
    messages: [{ role: 'user', content: query }],
  })

  const textBlock = response.content.find(b => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') return []

  const parseResponse = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: `Extract job listings from this text and return a JSON array. Each item should have: title, company, location, url, description, salary (or null). Only include real job listings with a URL.\n\nText:\n${textBlock.text}\n\nReturn only the JSON array, no explanation.`,
      },
    ],
  })

  const parseText = parseResponse.content.find(b => b.type === 'text')
  if (!parseText || parseText.type !== 'text') return []

  try {
    const match = parseText.text.match(/\[[\s\S]*\]/)
    if (!match) return []
    const parsed = JSON.parse(match[0]) as any[]
    return parsed
      .filter(j => j.title && j.company)
      .map(j => ({
        title: String(j.title),
        company: String(j.company),
        location: j.location ? String(j.location) : null,
        url: j.url ? String(j.url) : '',
        description: j.description ? String(j.description) : '',
        salary: j.salary ? String(j.salary) : null,
        source: siteList,
      }))
  } catch {
    return []
  }
}
