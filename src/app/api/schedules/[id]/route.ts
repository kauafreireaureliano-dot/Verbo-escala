export const runtime = 'edge'

import { getRequestContext } from '@cloudflare/next-on-pages'
import { getDb } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { generateSchedule } from '@/lib/schedule-generator'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  const schedule = await prisma.schedule.findUnique({
    where: { id: params.id },
    include: {
      department: true,
      entries: {
        include: { role: true, person: true },
        orderBy: { date: 'asc' },
      },
    },
  })
  if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(schedule)
}

export async function PUT(_request: Request, { params }: { params: { id: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)

  const schedule = await prisma.schedule.findUnique({ where: { id: params.id } })
  if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.scheduleEntry.deleteMany({ where: { scheduleId: params.id } })

  const daysOfWeek = JSON.parse(schedule.daysOfWeek) as number[]
  const start = new Date(schedule.startDate)
  const end = new Date(schedule.endDate)
  const dates: Date[] = []
  const current = new Date(start)
  while (current <= end) {
    if (daysOfWeek.includes(current.getDay())) {
      dates.push(new Date(current))
    }
    current.setDate(current.getDate() + 1)
  }

  const [roles, people] = await Promise.all([
    prisma.role.findMany({ where: { departmentId: schedule.departmentId } }),
    prisma.person.findMany({
      where: { departmentId: schedule.departmentId },
      include: { personRoles: true, unavailabilities: true },
    }),
  ])

  const entries = generateSchedule(dates, roles, people)

  for (const e of entries) {
    await prisma.scheduleEntry.create({
      data: { scheduleId: params.id, date: e.date, roleId: e.roleId, personId: e.personId },
    })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  await prisma.schedule.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
