export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const db = getDB()
    const dep = await db.prepare('SELECT * FROM "Department" WHERE slug = ?').bind(params.slug).first()
    if (!dep) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { results: roles } = await db.prepare('SELECT * FROM "Role" WHERE departmentId = ?').bind(dep.id).all()
    const { results: people } = await db.prepare('SELECT * FROM "Person" WHERE departmentId = ?').bind(dep.id).all()
    const { results: schedules } = await db.prepare('SELECT * FROM "Schedule" WHERE departmentId = ? ORDER BY createdAt ASC').bind(dep.id).all()
    return NextResponse.json({ ...dep, roles, people, schedules })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { slug: string } }) {
  try {
    const db = getDB()
    const { notes } = await request.json() as { notes: string }
    await db.prepare('UPDATE "Department" SET notes = ? WHERE slug = ?').bind(notes ?? '', params.slug).run()
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const db = getDB()
    await db.prepare('DELETE FROM "Department" WHERE slug = ?').bind(params.slug).run()
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
