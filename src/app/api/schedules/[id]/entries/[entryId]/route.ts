export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function PUT(request: Request, { params }: { params: { entryId: string } }) {
  try {
    const db = getDB()
    const { personId } = await request.json() as { personId: string }
    await db.prepare('UPDATE "ScheduleEntry" SET personId = ?, isManual = 1 WHERE id = ?').bind(personId, params.entryId).run()
    const e = await db.prepare(
      'SELECT e.id, e.date, e.isManual, e.roleId, e.personId, r.name as roleName, p.name as personName FROM "ScheduleEntry" e JOIN "Role" r ON r.id = e.roleId JOIN "Person" p ON p.id = e.personId WHERE e.id = ?'
    ).bind(params.entryId).first()
    if (!e) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({
      id: e.id, date: e.date, isManual: e.isManual === 1,
      role: { id: e.roleId, name: e.roleName },
      person: { id: e.personId, name: e.personName },
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { entryId: string } }) {
  try {
    const db = getDB()
    await db.prepare('DELETE FROM "ScheduleEntry" WHERE id = ?').bind(params.entryId).run()
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
