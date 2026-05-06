export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { getDB, newId } from '@/lib/db'
import { generateSchedule } from '@/lib/schedule-generator'

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const db = getDB()
    const dep = await db.prepare('SELECT id FROM "Department" WHERE slug = ?').bind(params.slug).first()
    if (!dep) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { results } = await db.prepare('SELECT * FROM "Schedule" WHERE departmentId = ? ORDER BY createdAt DESC').bind(dep.id).all()
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

    const { startDate, endDate, daysOfWeek } = await request.json() as { startDate: string; endDate: string; daysOfWeek: number[] }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const startFmt = start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
    const endFmt = end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    const name = `Escala ${startFmt} – ${endFmt}`

    const dates: Date[] = []
    const current = new Date(start)
    while (current <= end) {
      if (daysOfWeek.includes(current.getDay())) dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    const { results: roles } = await db.prepare('SELECT * FROM "Role" WHERE departmentId = ?').bind(dep.id).all()
    const { results: people } = await db.prepare('SELECT * FROM "Person" WHERE departmentId = ?').bind(dep.id).all()
    const { results: personRoles } = await db.prepare('SELECT * FROM "PersonRole" WHERE personId IN (SELECT id FROM "Person" WHERE departmentId = ?)').bind(dep.id).all()
    const { results: unavailabilities } = await db.prepare('SELECT * FROM "PersonUnavailability" WHERE personId IN (SELECT id FROM "Person" WHERE departmentId = ?)').bind(dep.id).all()

    const enrichedPeople = people.map((p) => ({
      id: p.id as string,
      name: p.name as string,
      maxServicesPerWeek: p.maxServicesPerWeek as number,
      personRoles: personRoles.filter((pr) => pr.personId === p.id).map((pr) => ({ roleId: pr.roleId as string })),
      unavailabilities: unavailabilities.filter((u) => u.personId === p.id).map((u) => ({ dayOfWeek: u.dayOfWeek as number })),
    }))

    const typedRoles = roles.map((r) => ({ id: r.id as string, name: r.name as string }))
    const entries = generateSchedule(dates, typedRoles, enrichedPeople)

    const schedId = newId()
    await db.prepare('INSERT INTO "Schedule" (id, name, departmentId, startDate, endDate, daysOfWeek) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(schedId, name, dep.id, start.toISOString(), end.toISOString(), JSON.stringify(daysOfWeek)).run()

    for (const e of entries) {
      await db.prepare('INSERT INTO "ScheduleEntry" (id, scheduleId, date, roleId, personId) VALUES (?, ?, ?, ?, ?)')
        .bind(newId(), schedId, e.date.toISOString(), e.roleId, e.personId).run()
    }

    const schedule = await db.prepare('SELECT * FROM "Schedule" WHERE id = ?').bind(schedId).first()
    return NextResponse.json(schedule)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
