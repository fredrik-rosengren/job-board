export type RawJob = {
  title: string
  company: string
  location: string | null
  url: string
  description: string
  salary: string | null
  source: string
}

export async function fetchJobtechJobs(keywords: string[], limit = 30): Promise<RawJob[]> {
  const jobs: RawJob[] = []

  for (const keyword of keywords.slice(0, 3)) {
    const params = new URLSearchParams({
      q: keyword,
      limit: String(Math.ceil(limit / keywords.length)),
      offset: '0',
    })

    const res = await fetch(`https://jobsearch.api.jobtechdev.se/search?${params}`, {
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) continue

    const data = await res.json() as { hits: any[] }
    for (const hit of data.hits ?? []) {
      jobs.push({
        title: hit.headline ?? '',
        company: hit.employer?.name ?? 'Okänt företag',
        location: hit.workplace_address?.municipality ?? hit.workplace_address?.region ?? null,
        url: hit.webpage_url ?? `https://arbetsformedlingen.se/platsbanken/annonser/${hit.id}`,
        description: hit.description?.text ?? '',
        salary: hit.salary_description ?? null,
        source: 'Arbetsförmedlingen',
      })
    }
  }

  const seen = new Set<string>()
  return jobs.filter(j => {
    const key = `${j.title}|${j.company}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
