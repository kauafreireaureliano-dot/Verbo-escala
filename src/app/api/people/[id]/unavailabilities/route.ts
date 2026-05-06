export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { getDB, newId } from '@/lib/db'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDB()
    const { results } = await db.prepare('SELECT * FROM "PersonUnavailability" WHERE personId = ? ORDER BY dayOfWeek').bind(params.id).all()
    return NextResponse.json(results)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDB()
    const { dayOfWeek } = await request.json() as { dayOfWeek: number }
    const id = newId()
    await db.prepare('INSERT OR IGNORE INTO "PersonUnavailability" (id, personId, dayOfWeek) VALUES (?, ?, ?)').bind(id, params.id, dayOfWeek).run()
    const row = await db.prepare('SELECT * FROM "PersonUnavailability" WHERE personId = ? AND dayOfWeek = ?').bind(params.id, dayOfWeek).first()
    return NextResponse.json(row)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
