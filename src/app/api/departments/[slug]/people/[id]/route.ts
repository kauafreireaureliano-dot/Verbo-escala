export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDB()
    const { name, maxServicesPerWeek, roleIds } = await request.json() as { name: string; maxServicesPerWeek: number; roleIds: string[] }
    const limitedRoleIds = (roleIds ?? []).slice(0, 2)

    await db.prepare('UPDATE "Person" SET name = ?, maxServicesPerWeek = ? WHERE id = ?')
      .bind(name, maxServicesPerWeek, params.id).run()
    await db.prepare('DELETE FROM "PersonRole" WHERE personId = ?').bind(params.id).run()
    for (const roleId of limitedRoleIds) {
      await db.prepare('INSERT OR IGNORE INTO "PersonRole" (personId, roleId) VALUES (?, ?)').bind(params.id, roleId).run()
    }

    const { results: personRoles } = await db.prepare(
      'SELECT pr.roleId, r.name as roleName FROM "PersonRole" pr JOIN "Role" r ON r.id = pr.roleId WHERE pr.personId = ?'
    ).bind(params.id).all()

    const person = await db.prepare('SELECT * FROM "Person" WHERE id = ?').bind(params.id).first()
    return NextResponse.json({
      ...person,
      personRoles: personRoles.map((r) => ({ roleId: r.roleId, role: { id: r.roleId, name: r.roleName } })),
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDB()
    await db.prepare('DELETE FROM "Person" WHERE id = ?').bind(params.id).run()
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
