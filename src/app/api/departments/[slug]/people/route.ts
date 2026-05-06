export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { getDB, newId } from '@/lib/db'

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const db = getDB()
    const dep = await db.prepare('SELECT id FROM "Department" WHERE slug = ?').bind(params.slug).first()
    if (!dep) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { results: people } = await db.prepare('SELECT * FROM "Person" WHERE departmentId = ? ORDER BY name').bind(dep.id).all()
    const { results: allRoles } = await db.prepare(
      'SELECT pr.personId, pr.roleId, r.name as roleName FROM "PersonRole" pr JOIN "Role" r ON r.id = pr.roleId WHERE pr.personId IN (SELECT id FROM "Person" WHERE departmentId = ?)'
    ).bind(dep.id).all()
    const { results: allUnav } = await db.prepare(
      'SELECT * FROM "PersonUnavailability" WHERE personId IN (SELECT id FROM "Person" WHERE departmentId = ?)'
    ).bind(dep.id).all()

    const enriched = people.map((p) => ({
      ...p,
      personRoles: allRoles
        .filter((r) => r.personId === p.id)
        .map((r) => ({ roleId: r.roleId, role: { id: r.roleId, name: r.roleName } })),
      unavailabilities: allUnav.filter((u) => u.personId === p.id),
    }))

    return NextResponse.json(enriched)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const db = getDB()
    const dep = await db.prepare('SELECT id FROM "Department" WHERE slug = ?').bind(params.slug).first()
    if (!dep) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { name, maxServicesPerWeek, roleIds } = await request.json() as { name: string; maxServicesPerWeek: number; roleIds: string[] }
    const limitedRoleIds = (roleIds ?? []).slice(0, 2)
    const id = newId()

    await db.prepare('INSERT INTO "Person" (id, name, maxServicesPerWeek, departmentId) VALUES (?, ?, ?, ?)')
      .bind(id, name, maxServicesPerWeek ?? 1, dep.id).run()

    for (const roleId of limitedRoleIds) {
      await db.prepare('INSERT OR IGNORE INTO "PersonRole" (personId, roleId) VALUES (?, ?)').bind(id, roleId).run()
    }

    const { results: personRoles } = await db.prepare(
      'SELECT pr.roleId, r.name as roleName FROM "PersonRole" pr JOIN "Role" r ON r.id = pr.roleId WHERE pr.personId = ?'
    ).bind(id).all()

    const person = await db.prepare('SELECT * FROM "Person" WHERE id = ?').bind(id).first()
    return NextResponse.json({
      ...person,
      personRoles: personRoles.map((r) => ({ roleId: r.roleId, role: { id: r.roleId, name: r.roleName } })),
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
