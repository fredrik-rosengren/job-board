import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb()
  const body = await req.json()
  const { id: idStr } = await params
  const id = parseInt(idStr)

  const allowed = ['title', 'company', 'location', 'url', 'description', 'score', 'stage', 'relevant', 'notes', 'salary']
  const updates = Object.entries(body)
    .filter(([key]) => allowed.includes(key))
    .map(([key, _]) => `${key} = ?`)

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const values = Object.entries(body)
    .filter(([key]) => allowed.includes(key))
    .map(([_, val]) => val)

  db.prepare(`
    UPDATE jobs SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?
  `).run(...values, id)

  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id)
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(job)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb()
  const { id: idStr } = await params
  const id = parseInt(idStr)
  db.prepare('DELETE FROM jobs WHERE id = ?').run(id)
  return NextResponse.json({ ok: true })
}
