export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { getDB, newId } from '@/lib/db'
import { generateSchedule } from '@/lib/schedule-generator'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDB()
    const schedule = await db.prepare('SELECT s.*, d.slug as dSlug, d.name as dName FROM "Schedule" s JOIN "Department" d ON d.id = s.departmentId WHERE s.id = ?').bind(params.id).first()
    if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { results: entries } = await db.prepare(
      'SELECT e.id, e.date, e.isManual, e.roleId, e.personId, r.name as roleName, p.name as personName FROM "ScheduleEntry" e JOIN "Role" r ON r.id = e.roleId JOIN "Person" p ON p.id = e.personId WHERE e.scheduleId = ? ORDER BY e.date'
    ).bind(params.id).all()

    return NextResponse.json({
      id: schedule.id,
      name: schedule.name,
      departmentId: schedule.departmentId,
      department: { slug: schedule.dSlug, name: schedule.dName },
      entries: entries.map((e) => ({
        id: e.id,
        date: e.date,
        isManual: e.isManual === 1,
        role: { id: e.roleId, name: e.roleName },
        person: { id: e.personId, name: e.personName },
      })),
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(_request: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDB()
    const schedule = await db.prepare('SELECT * FROM "Schedule" WHERE id = ?').bind(params.id).first()
    if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await db.prepare('DELETE FROM "ScheduleEntry" WHERE scheduleId = ?').bind(params.id).run()

    const daysOfWeek = JSON.parse(schedule.daysOfWeek as string) as number[]
    const start = new Date(schedule.startDate as string)
    const end = new Date(schedule.endDate as string)
    const dates: Date[] = []
    const current = new Date(start)
    while (current <= end) {
      if (daysOfWeek.includes(current.getDay())) dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    const { results: roles } = await db.prepare('SELECT * FROM "Role" WHERE departmentId = ?').bind(schedule.departmentId).all()
    const { results: people } = await db.prepare('SELECT * FROM "Person" WHERE departmentId = ?').bind(schedule.departmentId).all()
    const { results: personRoles } = await db.prepare('SELECT * FROM "PersonRole" WHERE personId IN (SELECT id FROM "Person" WHERE departmentId = ?)').bind(schedule.departmentId).all()
    const { results: unavailabilities } = await db.prepare('SELECT * FROM "PersonUnavailability" WHERE personId IN (SELECT id FROM "Person" WHERE departmentId = ?)').bind(schedule.departmentId).all()

    const enrichedPeople = people.map((p) => ({
      id: p.id as string,
      name: p.name as string,
      maxServicesPerWeek: p.maxServicesPerWeek as number,
      personRoles: personRoles.filter((pr) => pr.personId === p.id).map((pr) => ({ roleId: pr.roleId as string })),
      unavailabilities: unavailabilities.filter((u) => u.personId === p.id).map((u) => ({ dayOfWeek: u.dayOfWeek as number })),
    }))

    const typedRoles = roles.map((r) => ({ id: r.id as string, name: r.name as string }))
    const entries = generateSchedule(dates, typedRoles, enrichedPeople)

    for (const e of entries) {
      await db.prepare('INSERT INTO "ScheduleEntry" (id, scheduleId, date, roleId, personId) VALUES (?, ?, ?, ?, ?)')
        .bind(newId(), params.id, e.date.toISOString(), e.roleId, e.personId).run()
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDB()
    await db.prepare('DELETE FROM "Schedule" WHERE id = ?').bind(params.id).run()
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
