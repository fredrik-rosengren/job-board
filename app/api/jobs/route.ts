import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const stage = searchParams.get('stage')
  const q = searchParams.get('q')

  const client = await getSupabase()
  let query = (client.from('jobs') as any).select('*')

  if (stage) {
    query = query.eq('stage', stage)
  }

  if (q) {
    query = query.or(`title.ilike.%${q}%,company.ilike.%${q}%,description.ilike.%${q}%`)
  }

  const { data, error } = await query.order('score', { ascending: false }).order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, company, location, url, description, score, stage, notes, source, salary, deadline } = body

  if (!title || !company) {
    return NextResponse.json({ error: 'title and company are required' }, { status: 400 })
  }

  const client = await getSupabase()
  const { data, error } = await (client.from('jobs') as any)
    .insert([
      {
        title,
        company,
        location: location ?? null,
        url: url ?? null,
        description: description ?? null,
        score: score ?? 0,
        stage: stage ?? 'new',
        notes: notes ?? null,
        source: source ?? null,
        salary: salary ?? null,
        deadline: deadline ?? null,
      },
    ])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
