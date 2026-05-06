export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { getDB, newId } from '@/lib/db'

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const db = getDB()
    const dep = await db.prepare('SELECT id FROM "Department" WHERE slug = ?').bind(params.slug).first()
    if (!dep) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { results } = await db.prepare('SELECT * FROM "Role" WHERE departmentId = ?').bind(dep.id).all()
    return NextResponse.json(results)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const db = getDB()
    const dep = await db.prepare('SELECT id FROM "Department" WHERE slug = ?').bind(params.slug).first()
    if (!dep) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { name } = await request.json() as { name: string }
    const id = newId()
    await db.prepare('INSERT INTO "Role" (id, name, departmentId) VALUES (?, ?, ?)').bind(id, name, dep.id).run()
    const role = await db.prepare('SELECT * FROM "Role" WHERE id = ?').bind(id).first()
    return NextResponse.json(role)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
