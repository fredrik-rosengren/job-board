'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json()
  const { id: idStr } = await params
  const id = parseInt(idStr)

  const allowed = ['title', 'company', 'location', 'url', 'description', 'score', 'stage', 'relevant', 'notes', 'salary', 'deadline']
  const updates: Record<string, unknown> = {}

  Object.entries(body).forEach(([key, val]) => {
    if (allowed.includes(key)) {
      updates[key] = val
    }
  })

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const client = getSupabase()
  const { data, error } = await client
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = parseInt(idStr)

  const client = getSupabase()
  const { error } = await client
    .from('jobs')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
