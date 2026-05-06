export const runtime = 'edge'

import { getRequestContext } from '@cloudflare/next-on-pages'
import { getDb } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { generateSchedule } from '@/lib/schedule-generator'

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  const dep = await prisma.department.findUnique({ where: { slug: params.slug } })
  if (!dep) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const schedules = await prisma.schedule.findMany({
    where: { departmentId: dep.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(schedules)
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  const dep = await prisma.department.findUnique({ where: { slug: params.slug } })
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
    if ((daysOfWeek as number[]).includes(current.getDay())) {
      dates.push(new Date(current))
    }
    current.setDate(current.getDate() + 1)
  }

  const [roles, people] = await Promise.all([
    prisma.role.findMany({ where: { departmentId: dep.id } }),
    prisma.person.findMany({
      where: { departmentId: dep.id },
      include: { personRoles: true, unavailabilities: true },
    }),
  ])

  const entries = generateSchedule(dates, roles, people)

  const schedule = await prisma.schedule.create({
    data: {
      name,
      departmentId: dep.id,
      startDate: start,
      endDate: end,
      daysOfWeek: JSON.stringify(daysOfWeek),
      entries: {
        create: entries.map((e) => ({
          date: e.date,
          roleId: e.roleId,
          personId: e.personId,
        })),
      },
    },
  })

  return NextResponse.json(schedule)
}
